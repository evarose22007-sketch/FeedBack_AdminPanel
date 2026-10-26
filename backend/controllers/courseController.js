const Course = require('../models/Course');
const Feedback = require('../models/Feedback');
// GET/api/courses (for rating and countt)//
exports.listCourses = async (req, res) => {
  const [courses, stats] = await Promise.all([
    Course.find().sort({ name: 1 }).lean(),
    Feedback.aggregate([{ $group: { _id: '$course', average: { $avg: '$rating' }, count: { $sum: 1 } } }]),
  ]);
  const byCourse = new Map(stats.map((s) => [String(s._id), s]));
  res.json(
    courses.map((c) => {
      const s = byCourse.get(String(c._id));
      return {
        id: c._id,
        courseId: c.courseId,
        name: c.name,
        duration: c.duration,
        feedbackCount: s ? s.count : 0,
        averageRating: s ? Math.round(s.average * 10) / 10 : null,
      };
    })
  );
};
