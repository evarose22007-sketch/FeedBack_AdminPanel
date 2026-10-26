const { isValidObjectId } = require('mongoose');
const Feedback = require('../models/Feedback');
const Course = require('../models/Course');
const COURSE_FIELDS = 'courseId name duration';
// Course frontend part //
function toRow(doc) {
  const course = doc.course || {};
  return {
    id: doc._id,
    courseRef: course._id || null,
    courseId: course.courseId || '—',
    courseName: course.name || 'Course removed',
    courseDuration: course.duration || '—',
    comments: doc.comments,
    rating: doc.rating,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
// Checkform fields (empty when its valided).//
async function checkInput({ course, comments, rating }) {
  const problems = {};
  if (!course) problems.course = 'Choose the course this feedback is about.';
  else if (!isValidObjectId(course) || !(await Course.exists({ _id: course }))) problems.course = 'That course does not exist.';
  const text = typeof comments === 'string' ? comments.trim() : '';
  if (!text) problems.comments = 'Write a few words of feedback.';
  else if (text.length < 5) problems.comments = 'Feedback should be at least 5 characters.';
  else if (text.length > 1000) problems.comments = 'Keep feedback under 1000 characters.';
  const stars = Number(rating);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) problems.rating = 'Pick a rating from 1 to 5.';
  return problems;
}
const invalid = (res, fields) => res.status(422).json({ message: 'Some fields need attention.', fields });
const missing = (res) => res.status(404).json({ message: 'Feedback not found. It may have been deleted.' });
exports.listFeedback = async (req, res) => {
  const docs = await Feedback.find().populate('course', COURSE_FIELDS).sort({ createdAt: -1 });
  res.json(docs.map(toRow));
};
exports.getFeedback = async (req, res) => {
  if (!isValidObjectId(req.params.id)) return missing(res);
  const doc = await Feedback.findById(req.params.id).populate('course', COURSE_FIELDS);
  if (!doc) return missing(res);
  res.json(toRow(doc));
};
exports.createFeedback = async (req, res) => {
  const problems = await checkInput(req.body);
  if (Object.keys(problems).length) return invalid(res, problems);
  const doc = await Feedback.create({
    course: req.body.course,
    comments: req.body.comments.trim(),
    rating: Number(req.body.rating),
  });
  await doc.populate('course', COURSE_FIELDS);
  res.status(201).json(toRow(doc));
};
exports.updateFeedback = async (req, res) => {
  if (!isValidObjectId(req.params.id)) return missing(res);
  const problems = await checkInput(req.body);
  if (Object.keys(problems).length) return invalid(res, problems);
  const doc = await Feedback.findByIdAndUpdate(
    req.params.id,
    { course: req.body.course, comments: req.body.comments.trim(), rating: Number(req.body.rating) },
    { returnDocument: 'after', runValidators: true }
  ).populate('course', COURSE_FIELDS);
  if (!doc) return missing(res);
  res.json(toRow(doc));
};
exports.deleteFeedback = async (req, res) => {
  if (!isValidObjectId(req.params.id)) return missing(res);
  const doc = await Feedback.findByIdAndDelete(req.params.id);
  if (!doc) return missing(res);
  res.json({ message: 'Feedback deleted.', id: doc._id });
};
