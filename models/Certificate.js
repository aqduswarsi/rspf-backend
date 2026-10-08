const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    certificateId: { type: String, required: true, trim: true },
    quizName: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    score: { type: Number, required: true },
    completedOn: { type: String, required: true },
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Certificate", certificateSchema);
