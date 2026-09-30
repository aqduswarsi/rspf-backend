const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // "STEP 01 — Origin and Concept"
    description: { type: String, default: "" }, // "Direct Selling Basics"
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
    duration: { type: Number, default: 30 }, // minutes
    passPercentage: { type: Number, default: 50 }, // 50%
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Exam", examSchema);
