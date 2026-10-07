const mongoose = require("mongoose");

const reattemptRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BioData",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    resultId: { type: mongoose.Schema.Types.ObjectId, ref: "ExamResult" },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },
    adminNote: { type: String, default: "" },
    respondedBy: { type: String, default: "" },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ReattemptRequest", reattemptRequestSchema);
