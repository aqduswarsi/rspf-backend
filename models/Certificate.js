const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    certificateId: { type: String, required: true, trim: true },
    quizName: { type: String, trim: true },
    courseName: { type: String, required: true, trim: true },
    score: { type: Number },
    grade: { type: String, default: "", trim: true },
    completedOn: { type: String, required: true },

    // NAYE FIELDS
    place: { type: String, default: "RPSF/TC/GKP" },
    dateOfIssue: { type: String, default: "" },
    watermark: { type: String, default: "" },
    signatures: [
      {
        image: { type: String, default: "" },
        officerName: { type: String, default: "" },
        rank: { type: String, default: "" },
      },
    ],

    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Certificate", certificateSchema);
