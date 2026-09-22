const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const BioData = require("../models/BioData");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =========================================================
//                    ADMIN ROUTES
// =========================================================

// ---------- REGISTER ----------
router.post("/admin/register", async (req, res) => {
  try {
    const { name, email, password, phone, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashed,
      phone: phone || "",
      designation: designation || "",
      role: "admin",
      isActive: true,
    });

    res.status(201).json({
      message: "Admin registered successfully ✅",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- LOGIN ----------
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    // Only block if explicitly false (purana document me isActive undefined hoga)
    if (admin.isActive === false) {
      return res.status(403).json({ message: "Account disabled" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // Update last login
    admin.lastLogin = new Date();
    admin.lastLoginIP = req.ip || "";
    await admin.save();

    const token = jwt.sign(
      { userId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Admin login successful ✅",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone || "",
        designation: admin.designation || "",
        profilePic: admin.profilePic || "",
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- GET PROFILE ----------
router.get("/admin/profile", authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.userId).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- UPDATE PROFILE ----------
router.put("/admin/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone, designation, profilePic } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.user.userId,
      { name, phone, designation, profilePic },
      { new: true },
    ).select("-password");
    res.json({ message: "Profile updated ✅", admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- CHANGE PASSWORD ----------
router.put("/admin/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user.userId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(oldPassword, admin.password);
    if (!match) return res.status(400).json({ message: "Old password wrong" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: "Password changed ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- LIST ALL ADMINS ----------
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- DELETE ADMIN ----------
router.delete("/admin/:id", authMiddleware, async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  BIO DATA ROUTES
// =========================================================

// ---------- CREATE BIO DATA ----------
router.post("/users", authMiddleware, async (req, res) => {
  try {
    const bioData = await BioData.create(req.body);
    res.status(201).json({
      message: "BIO Data submitted successfully ✅",
      data: bioData,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- LIST ALL ----------
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const data = await BioData.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- UNVERIFIED ----------
router.get("/users/unverified", authMiddleware, async (req, res) => {
  try {
    const data = await BioData.find({ status: "unverified" }).sort({
      createdAt: -1,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- VERIFIED ----------
router.get("/users/verified", authMiddleware, async (req, res) => {
  try {
    const data = await BioData.find({ status: "verified" }).sort({
      createdAt: -1,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- GET ONE ----------
router.get("/users/:id", authMiddleware, async (req, res) => {
  try {
    const data = await BioData.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- UPDATE ----------
router.put("/users/:id", authMiddleware, async (req, res) => {
  try {
    const data = await BioData.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated ✅", data });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- ACCEPT ----------
router.patch("/users/:id/accept", authMiddleware, async (req, res) => {
  try {
    const data = await BioData.findByIdAndUpdate(
      req.params.id,
      {
        status: "verified",
        verifiedBy: req.user.email,
        verifiedAt: new Date(),
      },
      { new: true },
    );
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json({ message: "User accepted ✅", data });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- BLOCK ----------
router.patch("/users/:id/block", authMiddleware, async (req, res) => {
  try {
    const data = await BioData.findByIdAndUpdate(
      req.params.id,
      { status: "blocked" },
      { new: true },
    );
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json({ message: "User blocked", data });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- DELETE ----------
router.delete("/users/:id", authMiddleware, async (req, res) => {
  try {
    await BioData.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- STATS ----------
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const total = await BioData.countDocuments();
    const unverified = await BioData.countDocuments({ status: "unverified" });
    const verified = await BioData.countDocuments({ status: "verified" });
    const blocked = await BioData.countDocuments({ status: "blocked" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRegistered = await BioData.countDocuments({
      createdAt: { $gte: today },
    });

    res.json({ total, unverified, verified, blocked, todayRegistered });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  USER LOGIN (Phone + DOB)
// =========================================================

router.post("/user/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password required" });
    }

    const user = await BioData.findOne({ mobileNumber: phone });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Account blocked. Contact admin." });
    }

    if (user.status !== "verified") {
      return res.status(403).json({ message: "Account not verified yet." });
    }

    const dob = user.dateOfBirth || "";
    const parts = dob.split("-");
    const expectedPassword =
      parts.length === 3 ? `${parts[2]}${parts[1]}${parts[0]}` : "";

    if (!expectedPassword || password !== expectedPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, phone: user.mobileNumber, name: user.nameEnglish, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        name: user.nameEnglish,
        phone: user.mobileNumber,
        email: user.email,
        rank: user.rank,
        zone: user.zone,
        status: user.status,
        photo: user.photo,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
