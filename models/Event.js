const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" }, // base64 ya URL
    category: { type: String, default: "General" }, // General/Training/Recruitment/Meeting
    status: { type: String, default: "upcoming" }, // upcoming/ongoing/completed
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
