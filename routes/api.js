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
const Lesson = require("../models/Lesson");
const Question = require("../models/Question");
const ExamResult = require("../models/ExamResult");
const SupportTicket = require("../models/SupportTicket");
const ContactDetails = require("../models/ContactDetails");
const ReattemptRequest = require("../models/ReattemptRequest");
const CourseProforma = require("../models/CourseProforma");
const Certificate = require("../models/Certificate");

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
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const admin = await Admin.findById(req.user.userId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

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
//                  USER LOGIN (Phone + Custom Password / DOB)
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

    // ✅ Password check: custom password ya DOB (fallback)
    let passwordOk = false;

    if (user.password && user.password.length > 0) {
      // Custom password set hai
      passwordOk = await bcrypt.compare(password, user.password);
    } else {
      // Fallback: DOB (ddmmyyyy)
      const dob = user.dateOfBirth || "";
      const parts = dob.split("-");
      const expected =
        parts.length === 3 ? `${parts[2]}${parts[1]}${parts[0]}` : "";
      passwordOk = expected && password === expected;
    }

    if (!passwordOk) {
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
      // "mobileNumber",
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

    // Name kabhi blank na ho
    if (updates.nameEnglish !== undefined && !updates.nameEnglish.trim()) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    // Pin code 6 digit check
    for (const field of ["presentPinCode", "permanentPinCode"]) {
      if (updates[field] && !/^\d{6}$/.test(updates[field])) {
        return res
          .status(400)
          .json({ message: `${field} 6 digits ka hona chahiye` });
      }
    }

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
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Users only" });

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords don't match" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "Min 6 characters" });

    const user = await BioData.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "✅ Password updated successfully" });
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

// =========================================================
//                  LESSON ROUTES
// =========================================================

// CREATE LESSON (Admin only)
router.post("/education/lessons", authMiddleware, async (req, res) => {
  try {
    const { title, content, courseId, subjectId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (!courseId) {
      return res.status(400).json({ message: "Course is required" });
    }

    if (!subjectId) {
      return res.status(400).json({ message: "Subject is required" });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify subject exists and belongs to this course
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (subject.courseId.toString() !== courseId.toString()) {
      return res
        .status(400)
        .json({ message: "Subject does not belong to this course" });
    }

    const lesson = await Lesson.create({
      title: title.trim(),
      content,
      courseId,
      subjectId,
    });

    // Populate names for response
    const populated = await Lesson.findById(lesson._id)
      .populate("courseId", "name")
      .populate("subjectId", "name");

    res.status(201).json({
      message: "Lesson added successfully ✅",
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LIST ALL LESSONS (Public) — supports ?courseId= & ?subjectId=
router.get("/education/lessons", async (req, res) => {
  try {
    const { courseId, subjectId } = req.query;

    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;

    const lessons = await Lesson.find(filter)
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE LESSON (Admin only)
router.put("/education/lessons/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content, courseId, subjectId } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (courseId !== undefined) updateData.courseId = courseId;
    if (subjectId !== undefined) updateData.subjectId = subjectId;

    const lesson = await Lesson.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    })
      .populate("courseId", "name")
      .populate("subjectId", "name");

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    res.json({ message: "Lesson updated ✅", data: lesson });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE LESSON (Admin only)
router.delete("/education/lessons/:id", authMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ message: "Lesson deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  EXAM QUESTION ROUTES
// =========================================================

// CREATE QUESTION (Admin only)
router.post("/education/exam/questions", authMiddleware, async (req, res) => {
  try {
    const { question, type, options, correctAnswer, courseId, subjectId } =
      req.body;

    // Validation
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    const validTypes = ["MCQ", "Fill in the Blank", "True / False", "Written"];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ message: "Valid question type is required" });
    }

    if (!courseId) {
      return res.status(400).json({ message: "Course is required" });
    }

    if (!subjectId) {
      return res.status(400).json({ message: "Subject is required" });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify subject exists and belongs to course
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (subject.courseId.toString() !== courseId.toString()) {
      return res
        .status(400)
        .json({ message: "Subject does not belong to this course" });
    }

    // Type-specific validation
    let finalOptions = [];
    let finalAnswer = "";

    if (type === "MCQ") {
      if (!Array.isArray(options) || options.length < 2) {
        return res
          .status(400)
          .json({ message: "MCQ requires at least 2 options" });
      }
      if (!correctAnswer || !correctAnswer.trim()) {
        return res
          .status(400)
          .json({ message: "Correct answer is required for MCQ" });
      }
      finalOptions = options;
      finalAnswer = correctAnswer.trim();
    } else if (type === "Fill in the Blank") {
      if (!correctAnswer || !correctAnswer.trim()) {
        return res
          .status(400)
          .json({ message: "Correct answer is required" });
      }
      finalAnswer = correctAnswer.trim();
    } else if (type === "True / False") {
      if (!["True", "False"].includes(correctAnswer)) {
        return res
          .status(400)
          .json({ message: "Correct answer must be 'True' or 'False'" });
      }
      finalAnswer = correctAnswer;
    } else if (type === "Written") {
      finalAnswer = ""; // No correct answer for Written
    }

    const newQuestion = await Question.create({
      question: question.trim(),
      type,
      options: finalOptions,
      correctAnswer: finalAnswer,
      courseId,
      subjectId,
    });

    const populated = await Question.findById(newQuestion._id)
      .populate("courseId", "name")
      .populate("subjectId", "name");

    res.status(201).json({
      message: "Question added successfully ✅",
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LIST ALL QUESTIONS (Public) — supports filters
router.get("/education/exam/questions", async (req, res) => {
  try {
    const { courseId, subjectId, type } = req.query;

    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (type) filter.type = type;

    const questions = await Question.find(filter)
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET SINGLE QUESTION (Public)
router.get("/education/exam/questions/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("courseId", "name")
      .populate("subjectId", "name");

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE QUESTION (Admin only)
router.put("/education/exam/questions/:id", authMiddleware, async (req, res) => {
  try {
    const { question, type, options, correctAnswer, courseId, subjectId } =
      req.body;

    const updateData = {};
    if (question !== undefined) updateData.question = question.trim();
    if (type !== undefined) updateData.type = type;
    if (options !== undefined) updateData.options = options;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (courseId !== undefined) updateData.courseId = courseId;
    if (subjectId !== undefined) updateData.subjectId = subjectId;

    const updated = await Question.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    })
      .populate("courseId", "name")
      .populate("subjectId", "name");

    if (!updated) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ message: "Question updated ✅", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE QUESTION (Admin only)
router.delete(
  "/education/exam/questions/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const question = await Question.findByIdAndDelete(req.params.id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json({ message: "Question deleted ✅" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// =========================================================
//              EXAM SUBMIT (User)
// =========================================================

router.post("/education/exam/submit", authMiddleware, async (req, res) => {
  try {
    const { userId, courseId, subjectId, answers } = req.body;

    if (!userId || !courseId || !subjectId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers are required" });
    }

    // Verify user
    const user = await BioData.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify course
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Verify subject
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    // Fetch all questions
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    if (questions.length === 0) {
      return res.status(400).json({ message: "No valid questions found" });
    }

    let autoCorrect = 0;
    let autoWrong = 0;
    let writtenPending = 0;
    let maxScore = 0;

    const processedAnswers = [];

    for (const ans of answers) {
      const q = questions.find((qq) => qq._id.toString() === ans.questionId);
      if (!q) continue;

      const userAnswer = (ans.userAnswer || "").toString().trim();
      const correctAnswer = (q.correctAnswer || "").toString().trim();

      let isCorrect = false;
      let marks = 0;
      let reviewed = false;
      const maxMarks = 1;
      maxScore += maxMarks;

      if (q.type === "Written") {
        // Written — pending, admin will review
        writtenPending++;
        marks = 0;
        reviewed = false;
      } else {
        // Auto-check (case insensitive for Fill)
        if (q.type === "Fill in the Blank") {
          isCorrect =
            userAnswer.toLowerCase() === correctAnswer.toLowerCase() &&
            userAnswer !== "";
        } else {
          isCorrect = userAnswer === correctAnswer;
        }

        if (isCorrect) {
          marks = maxMarks;
          autoCorrect++;
        } else {
          autoWrong++;
        }
        reviewed = true;
      }

      processedAnswers.push({
        questionId: q._id,
        questionText: q.question,
        type: q.type,
        userAnswer,
        correctAnswer,
        isCorrect,
        marks,
        maxMarks,
        reviewed,
      });
    }

    const totalScore = processedAnswers.reduce(
      (sum, a) => sum + (a.marks || 0),
      0
    );

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Status
    let status = "pending";
    if (writtenPending === 0) {
      status = percentage >= 50 ? "Pass" : "Fail";
    }

    const result = await ExamResult.create({
      userId,
      courseId,
      subjectId,
      answers: processedAnswers,
      totalQuestions: processedAnswers.length,
      autoCorrect,
      autoWrong,
      writtenPending,
      totalScore,
      maxScore,
      percentage,
      status,
    });

    const populated = await ExamResult.findById(result._id)
      .populate("userId", "nameEnglish rollNumber mobileNumber presentAddress category")
      .populate("courseId", "name")
      .populate("subjectId", "name");

    res.status(201).json({
      message: "Exam submitted successfully ✅",
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//              EXAM RESULT ROUTES
// =========================================================

// LIST ALL RESULTS (Admin)
router.get("/education/exam/results", authMiddleware, async (req, res) => {
  try {
    const { userId, courseId, subjectId, status, isPrinted } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (status) filter.status = status;
    if (isPrinted !== undefined) filter.isPrinted = isPrinted === "true";

    const results = await ExamResult.find(filter)
      .populate("userId", "nameEnglish rollNumber mobileNumber presentAddress category")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET SINGLE RESULT
router.get("/education/exam/results/:id", authMiddleware, async (req, res) => {
  try {
    const result = await ExamResult.findById(req.params.id)
      .populate("userId", "nameEnglish rollNumber mobileNumber presentAddress category")
      .populate("courseId", "name")
      .populate("subjectId", "name");

    if (!result) return res.status(404).json({ message: "Result not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE RESULT (Admin — Written marks दे, status बदले, printed mark करे)
router.put("/education/exam/results/:id", authMiddleware, async (req, res) => {
  try {
    const { answers, isPrinted } = req.body;

    const result = await ExamResult.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Result not found" });

    // Update Written answers marks
    if (Array.isArray(answers)) {
      for (const updated of answers) {
        const existing = result.answers.find(
          (a) => a.questionId.toString() === updated.questionId
        );
        if (existing && existing.type === "Written") {
          existing.marks = updated.marks || 0;
          existing.isCorrect = (updated.marks || 0) > 0;
          existing.reviewed = true;
        }
      }
    }

    // Recalculate
    const totalScore = result.answers.reduce((sum, a) => sum + (a.marks || 0), 0);
    const writtenPending = result.answers.filter(
      (a) => a.type === "Written" && !a.reviewed
    ).length;

    result.totalScore = totalScore;
    result.writtenPending = writtenPending;
    result.percentage =
      result.maxScore > 0
        ? Math.round((totalScore / result.maxScore) * 100)
        : 0;

    if (writtenPending === 0) {
      result.status = result.percentage >= 50 ? "Pass" : "Fail";
    }

    if (isPrinted !== undefined) result.isPrinted = isPrinted;

    result.reviewedBy = req.user.email || "admin";
    result.reviewedAt = new Date();

    await result.save();

    const populated = await ExamResult.findById(result._id)
      .populate("userId", "nameEnglish rollNumber mobileNumber presentAddress category")
      .populate("courseId", "name")
      .populate("subjectId", "name");

    res.json({ message: "Result updated ✅", data: populated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE RESULT
router.delete("/education/exam/results/:id", authMiddleware, async (req, res) => {
  try {
    const result = await ExamResult.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.json({ message: "Result deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  SUPPORT TICKET ROUTES
// =========================================================

// CREATE TICKET (User)
router.post("/support/tickets", authMiddleware, async (req, res) => {
  try {
    const { userId, question } = req.body;

    if (!userId || !question || !question.trim()) {
      return res
        .status(400)
        .json({ message: "User and question are required" });
    }

    const ticket = await SupportTicket.create({
      userId,
      question: question.trim(),
    });

    res.status(201).json({
      message: "Ticket submitted successfully ✅",
      data: ticket,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LIST TICKETS (Admin) — ?status=pending|answered | ?userId=xyz
router.get("/support/tickets", authMiddleware, async (req, res) => {
  try {
    const { status, userId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const tickets = await SupportTicket.find(filter)
      .populate("userId", "nameEnglish rollNumber mobileNumber")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// REPLY TO TICKET (Admin)
router.put("/support/tickets/:id", authMiddleware, async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: "Answer is required" });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      {
        answer: answer.trim(),
        status: "answered",
        repliedBy: req.user.email || "admin",
        repliedAt: new Date(),
      },
      { new: true }
    ).populate("userId", "nameEnglish rollNumber mobileNumber");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.json({ message: "Ticket replied ✅", data: ticket });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE TICKET (Admin)
router.delete("/support/tickets/:id", authMiddleware, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json({ message: "Ticket deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  CONTACT DETAILS
// =========================================================

// GET (Public)
router.get("/contact/details", async (req, res) => {
  try {
    let contact = await ContactDetails.findOne();
    if (!contact) {
      contact = { phone: "", email: "", address: "", whatsapp: "" };
    }
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE (Admin) — upsert (single record)
router.put("/contact/details", authMiddleware, async (req, res) => {
  try {
    const { phone, email, address, whatsapp } = req.body;

    let contact = await ContactDetails.findOne();

    if (contact) {
      contact.phone = phone ?? contact.phone;
      contact.email = email ?? contact.email;
      contact.address = address ?? contact.address;
      contact.whatsapp = whatsapp ?? contact.whatsapp;
      await contact.save();
    } else {
      contact = await ContactDetails.create({
        phone,
        email,
        address,
        whatsapp,
      });
    }

    res.json({ message: "Contact details saved ✅", data: contact });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  EXAM ROUTES (NEW)
// =========================================================

const Exam = require("../models/Exam");

// ---------- ADMIN: CREATE EXAM ----------
router.post("/education/exams", authMiddleware, async (req, res) => {
  try {
    const {
      title, description, courseId, subjectId,
      duration, passPercentage, questionIds,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Exam title is required" });
    }
    if (!courseId) {
      return res.status(400).json({ message: "Course is required" });
    }
    if (!subjectId) {
      return res.status(400).json({ message: "Subject is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    if (subject.courseId.toString() !== courseId.toString()) {
      return res.status(400).json({ message: "Subject does not belong to this course" });
    }

    const exam = await Exam.create({
      title: title.trim(),
      description: description || "",
      courseId,
      subjectId,
      duration: duration || 30,
      passPercentage: passPercentage || 50,
      questionIds: Array.isArray(questionIds) ? questionIds : [],
      createdBy: req.user.email || "admin",
    });

    const populated = await Exam.findById(exam._id)
      .populate("courseId", "name")
      .populate("subjectId", "name");

    res.status(201).json({
      message: "Exam created successfully ✅",
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- ADMIN: LIST EXAMS ----------
router.get("/education/exams", authMiddleware, async (req, res) => {
  try {
    const { courseId, subjectId } = req.query;
    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;

    const exams = await Exam.find(filter)
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    // Har exam ke saath question count bhi bhejo
    const withCount = exams.map((e) => ({
      ...e.toObject(),
      questionCount: e.questionIds?.length || 0,
    }));

    res.json(withCount);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- ADMIN: GET SINGLE EXAM (with full questions) ----------
router.get("/education/exams/:id", authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("questionIds");

    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- ADMIN: UPDATE EXAM ----------
router.put("/education/exams/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, duration, passPercentage, isActive } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (passPercentage !== undefined) updateData.passPercentage = passPercentage;
    if (isActive !== undefined) updateData.isActive = isActive;

    const exam = await Exam.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("courseId", "name")
      .populate("subjectId", "name");

    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json({ message: "Exam updated ✅", data: exam });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- ADMIN: DELETE EXAM ----------
router.delete("/education/exams/:id", authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json({ message: "Exam deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- ADMIN: ATTACH QUESTIONS TO EXAM ----------
router.post("/education/exams/:id/questions", authMiddleware, async (req, res) => {
  try {
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: "questionIds array required" });
    }

    // Exam dhundo
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    // Saare questions exist karte hain?
    const found = await Question.find({ _id: { $in: questionIds } });
    if (found.length !== questionIds.length) {
      return res.status(400).json({ message: "Some questions not found" });
    }

    // ⚠️ ZARURI: har question exam ke SAME subject ka hona chahiye
    const examSubjectId = exam.subjectId?.toString();
    const wrongSubject = found.find((q) => {
      // Agar question ka subject null hai (purana data) toh allow karo
      if (!q.subjectId) return false;
      return q.subjectId.toString() !== examSubjectId;
    });

    if (wrongSubject) {
      return res.status(400).json({
        message:
          "❌ Is exam me sirf same subject ke questions attach ho sakte hain.",
      });
    }

    // Attach karo
    const updated = await Exam.findByIdAndUpdate(
      req.params.id,
      { questionIds },
      { new: true }
    )
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("questionIds");

    res.json({
      message: `✅ ${questionIds.length} questions attached`,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//              USER: AVAILABLE EXAMS
// =========================================================

// ---------- USER: GET EXAM + QUESTIONS ----------
router.get("/user/exams/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can access this" });
    }

    const exam = await Exam.findById(req.params.id)
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("questionIds");

    if (!exam) return res.status(404).json({ message: "Exam not found" });
    if (!exam.isActive) return res.status(400).json({ message: "Exam is not active" });

    // ✅ NEW: Already attempted check
    const existingResult = await ExamResult.findOne({
      userId: req.user.userId,
      examId: exam._id,
    });

    if (existingResult) {
      const approved = await ReattemptRequest.findOne({
        userId: req.user.userId,
        examId: exam._id,
        status: "approved",
      });

      if (!approved) {
        return res.status(403).json({
          message:
            "Aapne ye exam already attempt kar liya hai. Reattempt ke liye request submit karo.",
          alreadyAttempted: true,
        });
      }
    }

    // ⚠️ User ko correctAnswer mat bhejo
    const safeQuestions = (exam.questionIds || []).map((q) => ({
      _id: q._id,
      question: q.question,
      type: q.type,
      options: q.options,
    }));

    res.json({
      _id: exam._id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      passPercentage: exam.passPercentage,
      courseName: exam.courseId?.name || "",
      subjectName: exam.subjectId?.name || "",
      questions: safeQuestions,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- USER: SUBMIT EXAM ----------
router.post("/user/exams/:id/submit", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can access this" });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers are required" });
    }

    const exam = await Exam.findById(req.params.id).populate("questionIds");
    if (!exam) return res.status(404).json({ message: "Exam not found" });

        await ExamResult.findOneAndDelete({
          userId: req.user.userId,
          examId: exam._id,
        });

        // ✅ Approved request use ho gayi — delete karo
        await ReattemptRequest.findOneAndDelete({
          userId: req.user.userId,
          examId: exam._id,
          status: "approved",
        });

        const questions = exam.questionIds || [];

    if (questions.length === 0) {
      return res.status(400).json({ message: "This exam has no questions" });
    }

    let autoCorrect = 0, autoWrong = 0, writtenPending = 0, maxScore = 0;
    const processedAnswers = [];

    for (const q of questions) {
      const ans = answers.find((a) => a.questionId === q._id.toString());
      const userAnswer = (ans?.userAnswer || "").toString().trim();
      const correctAnswer = (q.correctAnswer || "").toString().trim();

      let isCorrect = false, marks = 0, reviewed = false;
      const maxMarks = 1;
      maxScore += maxMarks;

      if (q.type === "Written") {
        writtenPending++;
        marks = 0;
        reviewed = false;
      } else {
        if (q.type === "Fill in the Blank") {
          isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase() && userAnswer !== "";
        } else {
          isCorrect = userAnswer === correctAnswer;
        }
        marks = isCorrect ? maxMarks : 0;
        if (isCorrect) autoCorrect++; else autoWrong++;
        reviewed = true;
      }

      processedAnswers.push({
        questionId: q._id,
        questionText: q.question,
        type: q.type,
        userAnswer,
        correctAnswer,
        isCorrect,
        marks,
        maxMarks,
        reviewed,
      });
    }

    const totalScore = processedAnswers.reduce((s, a) => s + (a.marks || 0), 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    let status = "pending";
    if (writtenPending === 0) {
      status = percentage >= (exam.passPercentage || 50) ? "Pass" : "Fail";
    }

    const result = await ExamResult.create({
      userId: req.user.userId,
      examId: exam._id,
      courseId: exam.courseId,
      subjectId: exam.subjectId,
      answers: processedAnswers,
      totalQuestions: processedAnswers.length,
      autoCorrect,
      autoWrong,
      writtenPending,
      totalScore,
      maxScore,
      percentage,
      status,
    });

    const populated = await ExamResult.findById(result._id)
      .populate("userId", "nameEnglish rollNumber mobileNumber")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .populate("examId", "title");

    res.status(201).json({
      message: "Exam submitted successfully ✅",
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//              USER RESULTS + DASHBOARD STATS
// =========================================================

// ---------- USER: LIST AVAILABLE EXAMS ----------
router.get("/user/exams", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Only users can access this" });

    const exams = await Exam.find({ isActive: true })
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    const results = await ExamResult.find({ userId: req.user.userId }).select(
      "examId",
    );
    const attemptedExamIds = results
      .map((r) => r.examId?.toString())
      .filter(Boolean);

    const requests = await ReattemptRequest.find({
      userId: req.user.userId,
      status: { $in: ["pending", "approved"] },
    }).select("examId status");

    const requestMap = {};
    requests.forEach((r) => {
      requestMap[r.examId.toString()] = r.status;
    });

    const formatted = exams.map((e, idx) => {
      const examIdStr = e._id.toString();
      const attempted = attemptedExamIds.includes(examIdStr);
      const requestStatus = requestMap[examIdStr] || null;

      let canAttempt = true;
      if (attempted && requestStatus !== "approved") {
        canAttempt = false;
      }

      return {
        _id: e._id,
        step: `STEP ${String(idx + 1).padStart(2, "0")}`,
        title: e.title,
        description: e.description || e.courseId?.name || "",
        duration: e.duration,
        passPercentage: e.passPercentage,
        questionCount: e.questionIds?.length || 0,
        courseName: e.courseId?.name || "",
        subjectName: e.subjectId?.name || "",
        attempted,
        requestStatus,
        canAttempt,
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- USER: MY RESULTS LIST ----------
router.get("/user/results", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can access this" });
    }

    const results = await ExamResult.find({ userId: req.user.userId })
      .populate("examId", "title")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- USER: MY RESULT DETAIL ----------
router.get("/user/results/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can access this" });
    }

    const result = await ExamResult.findById(req.params.id)
      .populate("examId", "title")
      .populate("courseId", "name")
      .populate("subjectId", "name");

    if (!result) return res.status(404).json({ message: "Result not found" });
    if (result.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not your result" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- USER: DASHBOARD STATS ----------
router.get("/user/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can access this" });
    }

    const userId = req.user.userId;
    const total = await ExamResult.countDocuments({ userId });
    const passed = await ExamResult.countDocuments({ userId, status: "Pass" });
    const failed = await ExamResult.countDocuments({ userId, status: "Fail" });
    const pending = await ExamResult.countDocuments({ userId, status: "pending" });

    res.json({ total, passed, failed, pending });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  USER: TICKETS
// =========================================================

// LIST own tickets
router.get("/user/tickets", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Users only" });

    const tickets = await SupportTicket.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// CREATE ticket
router.post("/user/tickets", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Users only" });

    const { question } = req.body;
    if (!question || !question.trim())
      return res.status(400).json({ message: "Question required" });

    const ticket = await SupportTicket.create({
      userId: req.user.userId,        // token se
      question: question.trim(),
    });

    res.status(201).json({ message: "Ticket submitted ✅", data: ticket });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//              USER REATTEMPT REQUESTS
// =========================================================

// USER: submit reattempt request
router.post(
  "/user/exams/:id/reattempt-request",
  authMiddleware,
  async (req, res) => {
    try {
      if (req.user.role !== "user")
        return res.status(403).json({ message: "Users only" });

      const { reason } = req.body;
      if (!reason || !reason.trim())
        return res.status(400).json({ message: "Reason required hai" });

      const examId = req.params.id;

      // Check user has attempted
      const existingResult = await ExamResult.findOne({
        userId: req.user.userId,
        examId,
      });
      if (!existingResult)
        return res
          .status(400)
          .json({ message: "Aapne ye exam attempt nahi kiya" });

      // Pending request already?
      const pending = await ReattemptRequest.findOne({
        userId: req.user.userId,
        examId,
        status: "pending",
      });
      if (pending)
        return res
          .status(400)
          .json({ message: "Aapka request already pending hai" });

      const request = await ReattemptRequest.create({
        userId: req.user.userId,
        examId,
        resultId: existingResult._id,
        reason: reason.trim(),
      });

      res
        .status(201)
        .json({ message: "Request submit ho gaya", data: request });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

// USER: own reattempt requests
router.get("/user/reattempt-requests", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Users only" });

    const requests = await ReattemptRequest.find({ userId: req.user.userId })
      .populate("examId", "title")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ADMIN: list requests
router.get("/admin/reattempt-requests", authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const requests = await ReattemptRequest.find(filter)
      .populate("userId", "nameEnglish rollNumber mobileNumber")
      .populate("examId", "title")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ADMIN: approve / reject
router.put(
  "/admin/reattempt-requests/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { status, adminNote } = req.body;

      if (!["approved", "rejected"].includes(status))
        return res.status(400).json({ message: "Invalid status" });

      const request = await ReattemptRequest.findByIdAndUpdate(
        req.params.id,
        {
          status,
          adminNote: adminNote || "",
          respondedBy: req.user.email || "admin",
          respondedAt: new Date(),
        },
        { new: true },
      )
        .populate("userId", "nameEnglish rollNumber")
        .populate("examId", "title");

      if (!request)
        return res.status(404).json({ message: "Request not found" });

      res.json({ message: `Request ${status}`, data: request });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

// =========================================================
//                  COURSE PROFORMA (Data Entry)
// =========================================================

// CREATE
router.post("/course-proforma", authMiddleware, async (req, res) => {
  try {
    const data = await CourseProforma.create({
      ...req.body,
      createdBy: req.user.email || "admin",
    });
    res.status(201).json({
      message: "Record created successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LIST ALL
router.get("/course-proforma", authMiddleware, async (req, res) => {
  try {
    const records = await CourseProforma.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET ONE
router.get("/course-proforma/:id", authMiddleware, async (req, res) => {
  try {
    const record = await CourseProforma.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE
router.put("/course-proforma/:id", authMiddleware, async (req, res) => {
  try {
    const record = await CourseProforma.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Record updated successfully", data: record });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE
router.delete("/course-proforma/:id", authMiddleware, async (req, res) => {
  try {
    const record = await CourseProforma.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// =========================================================
//                  CERTIFICATES
// =========================================================

router.post("/certificates", authMiddleware, async (req, res) => {
  try {
    const cert = await Certificate.create({
      ...req.body,
      createdBy: req.user.email || "admin",
    });
    res.status(201).json({ message: "Certificate created successfully", data: cert });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/certificates", authMiddleware, async (req, res) => {
  try {
    const certs = await Certificate.find().sort({ createdAt: -1 });
    res.json(certs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/certificates/:id", authMiddleware, async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: "Not found" });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/certificates/:id", authMiddleware, async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Certificate deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
