const mongoose = require("mongoose");

const facultyMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    facultyType: { type: String, enum: ["Indoor", "Outdoor"], required: true },
    designation: { type: String, required: true },
    instructorType: { type: String, default: "" },
    rank: { type: String, default: "" },
    subject: { type: String, default: "" },
    placeOfPosting: { type: String, default: "" },
    education: { type: String, default: "" },
    uimNumber: { type: String, required: true, unique: true }, // UIM Number unique hona chahiye
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FacultyMember", facultyMemberSchema);
