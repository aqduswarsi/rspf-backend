const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BioData",
      required: true,
    },
    question: { type: String, required: true, trim: true },
    answer: { type: String, default: "" },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "answered"],
    },
    repliedBy: { type: String, default: "" },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
