const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, default: "" },
    image: { type: String, default: "" },
    category: { type: String, default: "General" }, // General/Announcement/Notice/Update
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("News", newsSchema);
