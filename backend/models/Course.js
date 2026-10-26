const { Schema, model } = require('mongoose');
const courseSchema = new Schema(
  {
    courseId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);
module.exports = model('Course', courseSchema);