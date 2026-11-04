const mongoose = require("mongoose");

const guestLectureSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    guestName: { type: String, required: true },
    designation: { type: String, required: true },
    placeOfPosting: { type: String, required: true },
    course: { type: String, default: "" },
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
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    signOfLecturer: { type: String, default: "" },
    signOfPTC: { type: String, default: "" },
    remark: {
      type: String,
      enum: ["Paid", "Non-Paid"],
      required: true,
    },
    guestHonorarium: { type: String, default: "" }, // 👈 नया फील्ड जोड़ा गया
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("GuestLecture", guestLectureSchema);
