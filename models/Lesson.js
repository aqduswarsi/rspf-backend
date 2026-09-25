const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    content: { type: String, required: true }, // HTML (rich text)
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Lesson", lessonSchema);
