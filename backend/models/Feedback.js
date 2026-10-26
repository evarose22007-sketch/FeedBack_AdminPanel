const { Schema, model } = require('mongoose');
// CourseID and duration = from the linked Course document. //
const feedbackSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    comments: { type: String, required: true, trim: true, maxlength: 1000 },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);
module.exports = model('Feedback', feedbackSchema);
