const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    // English
    question: { type: String, required: true, trim: true },

    // Hindi (optional)
    questionHindi: { type: String, default: "", trim: true },

    type: {
      type: String,
      required: true,
      enum: ["MCQ", "Fill in the Blank", "True / False", "Written"],
    },

    // MCQ only — English
    options: { type: [String], default: [] },

    // MCQ only — Hindi (same index as English options)
    optionsHindi: { type: [String], default: [] },

    // MCQ: letter (A/B/C/D), T/F: True/False, Fill: text, Written: ""
    correctAnswer: { type: String, default: "" },

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