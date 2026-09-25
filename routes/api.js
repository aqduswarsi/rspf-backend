const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const BioData = require("../models/BioData");
const authMiddleware = require("../middleware/authMiddleware");

const Event = require("../models/Event");
const News = require("../models/News");
const Gallery = require("../models/Gallery");
const Course = require("../models/Course");
const Subject = require("../models/Subject");

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

    if (admin.isActive === false) {
      return res.status(403).json({ message: "Account disabled" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

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

// ---------- CREATE BIO DATA (Admin only — verified) ----------
router.post("/users", authMiddleware, async (req, res) => {
  try {
    const bioData = await BioData.create({
      ...req.body,
      status: "verified",          // ← Admin बनाए तो directly verified
      verifiedBy: req.user.email || "admin",
      verifiedAt: new Date(),
    });
    res.status(201).json({
      message: "BIO Data added successfully ✅",
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
      return res
        .status(403)
        .json({ message: "Account blocked. Contact admin." });
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
      {
        userId: user._id,
        phone: user.mobileNumber,
        name: user.nameEnglish,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
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

// =========================================================
//                  USER PROFILE (own data)
// =========================================================

router.get("/user/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can access this" });
    }

    const user = await BioData.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/user/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can update this" });
    }

    const allowed = [
      // Photo
      "photo",
      // Name & Parents
      "nameEnglish",
      "nameHindi",
      "fatherNameEnglish",
      "fatherNameHindi",
      "motherNameEnglish",
      "motherNameHindi",
      // Contact
      "mobileNumber",
      "alternateMobile",
      "mobileWhatsapp",
      "alternateWhatsapp",
      "email",
      // Address
      "presentAddress",
      "presentPinCode",
      "permanentAddress",
      "permanentPinCode",
      "state",
      // Other
      "bloodGroup",
      "religion",
      "category",
      "caste",
    ];

    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await BioData.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
    });

    res.json({ message: "Profile updated ✅", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  USER CHANGE PASSWORD
// =========================================================

router.put("/user/change-password", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can access this" });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await BioData.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Old password = DOB (ddmmyyyy) check
    const dob = user.dateOfBirth || "";
    const parts = dob.split("-");
    const expectedPassword =
      parts.length === 3 ? `${parts[2]}${parts[1]}${parts[0]}` : "";

    if (oldPassword !== expectedPassword) {
      return res.status(400).json({ message: "Old password wrong" });
    }

    // Currently password is fixed as DOB — no custom password field in schema
    // So we return informative message
    res.json({
      message:
        "ℹ️ Your password is fixed as DOB (ddmmyyyy). Contact admin to change it.",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  EVENT ROUTES
// =========================================================

// CREATE EVENT
router.post("/events", authMiddleware, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({
      message: "Event added successfully ✅",
      data: event,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LIST ALL EVENTS
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE EVENT
router.put("/events/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event updated ✅", data: event });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE EVENT
router.delete("/events/:id", authMiddleware, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  NEWS ROUTES
// =========================================================

// CREATE NEWS
router.post("/news", authMiddleware, async (req, res) => {
  try {
    const news = await News.create(req.body);
    res.status(201).json({
      message: "News added successfully ✅",
      data: news,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LIST ALL NEWS
router.get("/news", async (req, res) => {
  try {
    const newsList = await News.find().sort({ createdAt: -1 });
    res.json(newsList);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE NEWS
router.put("/news/:id", authMiddleware, async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!news) return res.status(404).json({ message: "News not found" });
    res.json({ message: "News updated ✅", data: news });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE NEWS
router.delete("/news/:id", authMiddleware, async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "News deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  GALLERY ROUTES
// =========================================================

// CREATE GALLERY IMAGE
router.post("/gallery", authMiddleware, async (req, res) => {
  try {
    const gallery = await Gallery.create(req.body);
    res.status(201).json({
      message: "Image added to gallery ✅",
      data: gallery,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LIST ALL GALLERY
router.get("/gallery", async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE GALLERY
router.put("/gallery/:id", authMiddleware, async (req, res) => {
  try {
    const gallery = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!gallery) return res.status(404).json({ message: "Image not found" });
    res.json({ message: "Image updated ✅", data: gallery });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE GALLERY IMAGE
router.delete("/gallery/:id", authMiddleware, async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: "Image deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//              PUBLIC REGISTRATION (No Auth Required)
// =========================================================

router.post("/public/register", async (req, res) => {
  try {
    const { nameEnglish, mobileNumber, declarationAccepted } = req.body;

    // Basic validation
    if (!nameEnglish || !mobileNumber) {
      return res.status(400).json({
        message: "Name and Mobile Number are required",
      });
    }

    if (!declarationAccepted) {
      return res.status(400).json({
        message: "Please accept the Declaration",
      });
    }

    // Check duplicate mobile
    const existing = await BioData.findOne({ mobileNumber });
    if (existing) {
      return res.status(400).json({
        message: "This mobile number is already registered",
      });
    }

    // Create with status unverified
    const bioData = await BioData.create({
      ...req.body,
      status: "unverified",
    });

    res.status(201).json({
      message: "Registration successful! Please wait for admin verification.",
      data: {
        id: bioData._id,
        nameEnglish: bioData.nameEnglish,
        mobileNumber: bioData.mobileNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  COURSE ROUTES
// =========================================================

// CREATE COURSE (Admin only)
router.post("/education/courses", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Course name is required" });
    }

    // Duplicate check (case-insensitive)
    const existing = await Course.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });
    if (existing) {
      return res.status(400).json({ message: "Course already exists" });
    }

    const course = await Course.create({ name: name.trim() });
    res.status(201).json({
      message: "Course added successfully ✅",
      data: course,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LIST ALL COURSES (Public)
router.get("/education/courses", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE COURSE (Admin only)
router.put("/education/courses/:id", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Course name is required" });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true }
    );

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json({ message: "Course updated ✅", data: course });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE COURSE (Admin only)
router.delete("/education/courses/:id", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  SUBJECT ROUTES
// =========================================================

// CREATE SUBJECT (Admin only)
router.post("/education/subjects", authMiddleware, async (req, res) => {
  try {
    const { name, courseId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    if (!courseId) {
      return res.status(400).json({ message: "Course is required" });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Duplicate check within same course
    const existing = await Subject.findOne({
      courseId,
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Subject already exists in this course" });
    }

    const subject = await Subject.create({
      name: name.trim(),
      courseId,
    });

    // Populate course name for response
    const populated = await Subject.findById(subject._id).populate(
      "courseId",
      "name"
    );

    res.status(201).json({
      message: "Subject added successfully ✅",
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LIST ALL SUBJECTS (Public) — supports ?courseId=xyz filter
router.get("/education/subjects", async (req, res) => {
  try {
    const { courseId } = req.query;

    const filter = {};
    if (courseId) filter.courseId = courseId;

    const subjects = await Subject.find(filter)
      .populate("courseId", "name")
      .sort({ createdAt: -1 });

    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE SUBJECT (Admin only)
router.put("/education/subjects/:id", authMiddleware, async (req, res) => {
  try {
    const { name, courseId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const updateData = { name: name.trim() };
    if (courseId) updateData.courseId = courseId;

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("courseId", "name");

    if (!subject) return res.status(404).json({ message: "Subject not found" });

    res.json({ message: "Subject updated ✅", data: subject });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE SUBJECT (Admin only)
router.delete("/education/subjects/:id", authMiddleware, async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json({ message: "Subject deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
