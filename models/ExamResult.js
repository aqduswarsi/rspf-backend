const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    questionText: String, // snapshot
    type: String, // MCQ / Fill in the Blank / True / False / Written
    userAnswer: { type: String, default: "" },
    correctAnswer: { type: String, default: "" }, // snapshot
    isCorrect: { type: Boolean, default: false },
    marks: { type: Number, default: 0 }, // Written के लिए admin देगा
    maxMarks: { type: Number, default: 1 }, // default 1
    reviewed: { type: Boolean, default: false }, // Written के लिए admin mark करेगा
  },
  { _id: false },
);

const examResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BioData",
      required: true,
    },
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

    answers: { type: [answerSchema], default: [] },

    totalQuestions: { type: Number, default: 0 },
    autoCorrect: { type: Number, default: 0 }, // MCQ/TF/Fill सही
    autoWrong: { type: Number, default: 0 }, // MCQ/TF/Fill गलत
    writtenPending: { type: Number, default: 0 }, // Written जो अभी pending हैं
    totalScore: { type: Number, default: 0 }, // auto + written (final)
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },

    status: {
      type: String,
      default: "pending",
      enum: ["pending", "Pass", "Fail"],
    },
    isPrinted: { type: Boolean, default: false },

    reviewedBy: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ExamResult", examResultSchema);
