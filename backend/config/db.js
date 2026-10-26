const mongoose = require('mongoose');
const Course = require('../models/Course');
const Feedback = require('../models/Feedback');
const catalogue = require('../data/courses');

async function connectDB(uri) {
  await mongoose.connect(uri);
  console.log(`MongoDB connected (${mongoose.connection.name})`);
}

// Keeps the courses in MongoDB the same as data/courses.js. Runs on every start.
// - Adds new courses and updates the name/duration of existing ones.
// - Removes courses that are no longer in the list. If an old course has the same
//   name as a course in the list (its ID was changed), its feedback is moved to that course.
async function ensureCourses() {
  await Course.bulkWrite(
    catalogue.map((c) => ({
      updateOne: { filter: { courseId: c.courseId.toUpperCase() }, update: { $set: c }, upsert: true },
    }))
  );

  const keepIds = catalogue.map((c) => c.courseId.toUpperCase());
  const stale = await Course.find({ courseId: { $nin: keepIds } });

  for (const old of stale) {
    const match = await Course.findOne({ courseId: { $in: keepIds }, name: old.name });
    const used = await Feedback.exists({ course: old._id });

    if (match) {
      await Feedback.updateMany({ course: old._id }, { $set: { course: match._id } });
    } else if (used) {
      continue; // still has feedback and no replacement course, so keep it
    }
    await old.deleteOne();
    console.log(`Removed old course ${old.courseId}${match ? ` (feedback moved to ${match.courseId})` : ''}`);
  }
}

module.exports = { connectDB, ensureCourses };
