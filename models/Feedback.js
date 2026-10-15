const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    // Part 1 - Training & Trainee Details
    trainingCentre: { type: String, default: "RPSF TC/2BN/GKP" },
    courseMode: { type: String, default: "" },
    courseCategory: { type: String, default: "" },
    courseName: { type: String, default: "" },
    batch: { type: String, default: "" },
    fromDate: { type: String, default: "" },
    toDate: { type: String, default: "" },
    instructor: { type: String, default: "" },
    feedbackStage: { type: String, default: "" },
    courseStatus: { type: String, default: "" },
    language: { type: String, default: "" },
    traineeName: { type: String, default: "" },
    traineeId: { type: String, default: "" },
    railwayZone: { type: String, default: "" },

    // Part 2-13 - Rating Sections (stored as objects)
    curriculum: { type: Object, default: {} }, // C01-C10
    instructorRating: { type: Object, default: {} }, // F01-F10
    methodsSelected: { type: [String], default: [] },
    methodology: { type: Object, default: {} }, // TM01-TM09
    classroom: { type: Object, default: {} }, // 101-110
    barrack: { type: Object, default: {} }, // B01-B10
    food: { type: Object, default: {} }, // M01-M08
    hygiene: { type: Object, default: {} }, // H01-H09
    online: { type: Object, default: {} }, // 001-012
    physical: { type: Object, default: {} }, // P01-P10
    women: { type: Object, default: {} }, // W01-W10
    discipline: { type: Object, default: {} }, // A01-A10
    learning: { type: Object, default: {} }, // L01-L07

    // Part 13 - Self Assessment
    selfAssessment: {
      beforeTraining: { type: String, default: "" },
      afterTraining: { type: String, default: "" },
      skillImprovedMost: { type: String, default: "" },
      skillNeedsPractice: { type: String, default: "" },
    },

    // Part 14 - Overall
    overallCourseRating: { type: String, default: "" },
    mostUsefulAspect: { type: String, default: "" },
    areasRequiringImprovement: { type: String, default: "" },
    otherSuggestions: { type: String, default: "" },
    wouldRecommend: { type: String, default: "" },
    reportIssue: { type: String, default: "" },
    issueDetails: { type: String, default: "" },
    priority: { type: String, default: "" },

    // Part 15 - Administrative (hidden from trainees)
    adminCategory: { type: String, default: "" },
    adminPriority: { type: String, default: "" },
    assignedTo: { type: String, default: "" },
    actionTaken: { type: String, default: "" },
    adminStatus: { type: String, default: "" },
    resolutionRemarks: { type: String, default: "" },
    verifiedBy: { type: String, default: "" },
    reopened: { type: String, default: "" },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BioData",
      default: null,
    },
    adminReviewed: { type: Boolean, default: false },
    adminReviewedBy: { type: String, default: "" },
    adminReviewedAt: { type: Date, default: null },

    // Computed average (excludes N/A and blanks)
    averageRating: { type: Number, default: 0 },

    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Feedback", feedbackSchema);
