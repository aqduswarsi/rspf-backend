const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    image: { type: String, required: true }, // base64 ya URL
    category: { type: String, default: "General" }, // General/Events/Training/Ceremony
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Gallery", gallerySchema);
