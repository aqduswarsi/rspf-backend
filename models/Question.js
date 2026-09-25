const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["MCQ", "Fill in the Blank", "True / False", "Written"],
    },
    options: { type: [String], default: [] }, // MCQ only
    correctAnswer: { type: String, default: "" }, // MCQ: letter, T/F: True/False, Fill: text, Written: ""
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

module.exports = mongoose.model("Question", questionSchema);
