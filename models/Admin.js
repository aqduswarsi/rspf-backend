const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin", enum: ["admin", "superadmin"] },

    // Extra fields jo admin ke kaam aayenge
    phone: { type: String, default: "" },
    designation: { type: String, default: "" },
    profilePic: { type: String, default: "" }, // base64 ya URL

    // Status
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    lastLoginIP: { type: String, default: "" },

    // Password reset
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admin", adminSchema);
