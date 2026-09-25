const mongoose = require("mongoose");

const contactDetailsSchema = new mongoose.Schema(
  {
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ContactDetails", contactDetailsSchema);
