const mongoose = require("mongoose");

const guestLectureSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    guestName: { type: String, required: true },
    designation: { type: String, required: true },
    placeOfPosting: { type: String, required: true },
    status: {
      type: String,
      enum: ["In Service", "Retired"],
      required: true,
    },
    employeeType: {
      type: String,
      enum: ["Railway Emp", "Non-Railway Emp"],
      required: true,
    },
    subject: { type: String, required: true },
    startTime: { type: String, required: true }, // e.g. "06:00"
    endTime: { type: String, required: true }, // e.g. "07:30"
    signOfLecturer: { type: String, default: "" }, // base64 image ya text
    signOfPTC: { type: String, default: "" },
    remark: {
      type: String,
      enum: ["Paid", "Non-Paid"],
      required: true,
    },
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("GuestLecture", guestLectureSchema);
