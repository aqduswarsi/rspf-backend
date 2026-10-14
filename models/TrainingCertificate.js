const mongoose = require("mongoose");

const trainingCertificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, default: "", trim: true },
    traineeName: { type: String, required: true, trim: true },
    unit: { type: String, default: "" },
    trainingCourse: { type: String, required: true },
    grade: { type: String, default: "" },
    batch: { type: String, default: "" },
    fromDate: { type: String, default: "" },
    toDate: { type: String, default: "" },
    place: { type: String, default: "RPSF/TC/GKP" },
    dateOfIssue: { type: String, default: "" },

    // Watermark
    watermark: { type: String, default: "" },

    // 3 Signatures
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

module.exports = mongoose.model(
  "TrainingCertificate",
  trainingCertificateSchema,
);
