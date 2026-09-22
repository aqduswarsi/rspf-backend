const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const apiRoutes = require("./routes/api");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" })); // 📸 photo base64 ke liye limit badhaya

// MongoDB Atlas Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err.message));

// ==================== ROUTES ====================
// Health check
app.get("/", (req, res) => res.json({ message: "RSPF API running 🚀" }));

// ⭐ SAARE ROUTES EK HI FILE SE
app.use("/api", apiRoutes);

// Profile (protected route test ke liye)
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
