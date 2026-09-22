const mongoose = require("mongoose");

const bioDataSchema = new mongoose.Schema(
  {
    // === PHOTO ===
    photo: { type: String, default: "" },

    // === 1-2. IDENTITY ===
    rollNumber: String,
    rank: String,

    // === 3-8. NAME & PARENTS ===
    nameEnglish: { type: String, required: true },
    nameHindi: String,
    fatherNameEnglish: String,
    fatherNameHindi: String,
    motherNameEnglish: String,
    motherNameHindi: String,

    // === 9-11. DATES ===
    dateOfBirth: String,
    dateOfEnlistment: String,
    dateOfAppointment: String,

    // === 12-13. POSTING ===
    presentPosting: String,
    permanentPosting: String,

    // === 14-15. ID NUMBERS ===
    aadharNumber: String,
    panNumber: String,

    // === 16-17. CONTACT ===
    mobileNumber: String,
    mobileWhatsapp: String,
    alternateMobile: String,
    alternateWhatsapp: String,

    // === 18. GUARDIAN ===
    guardianContact: String,
    guardianName: String,
    guardianRelation: String,

    // === 19. EMERGENCY ===
    emergencyContact: String,
    emergencyName: String,
    emergencyRelation: String,

    // === 20-22. ZONE ===
    email: String,
    zone: String,
    nearestStation: String,

    // === 23-24. IDENTIFICATION ===
    identificationMark1: String,
    identificationMark2: String,

    // === 25-28. CATEGORY ===
    religion: String,
    category: String,
    caste: String,
    allotedCategory: String,
    bloodGroup: String,

    // === 29-32. EDUCATION ===
    educationalQualification: String,
    professionalKnowledge: String,
    vocationalTraining: String,

    // === 33. EXPERIENCE ===
    expSwimming: { type: Boolean, default: false },
    expCycling: { type: Boolean, default: false },
    expMotorcycle: { type: Boolean, default: false },
    expCar: { type: Boolean, default: false },
    expDrivingLicense: { type: Boolean, default: false },

    // === 34-35. LANGUAGE ===
    languageKnown: String,
    examLanguage: String,

    // === 36. BODY ===
    height: String,
    weight: String,

    // === 37-39. ADDRESS ===
    presentAddress: String,
    presentPinCode: String,
    permanentAddress: String,
    permanentPinCode: String,
    state: String,

    // === 40-43. FAMILY ===
    maritalStatus: String,
    spouseName: String,
    childrenName: String,
    nominee: String,

    // === 44. EMPLOYMENT ===
    previousEmployment: String,

    // === 45-47. BANK ===
    bankName: String,
    bankAccountNo: String,
    bankIFSC: String,
    bankMICR: String,
    bankBranchAddress: String,

    // === 48-49. MEDICAL ===
    medicalHistory: String,
    medicalPlace: String,

    // === 50. FOOD ===
    foodVeg: { type: Boolean, default: false },
    foodNonVeg: { type: Boolean, default: false },
    foodEgg: { type: Boolean, default: false },
    foodFish: { type: Boolean, default: false },
    foodChicken: { type: Boolean, default: false },
    foodMutton: { type: Boolean, default: false },

    // === 51-52. SIZES ===
    shirtSize: String,
    trouserSize: String,
    shoesSize: String,
    slipperSize: String,

    // === 53. REPORTING ===
    dateOfReporting: String,
    diaryEntryNo: String,
    reportingTime: String,

    // === 54. ANY OTHER ===
    anyOther: String,

    // === 55. DECLARATION ===
    declarationAccepted: { type: Boolean, default: false },

    // === STATUS ===
    status: {
      type: String,
      default: "unverified",
      enum: ["unverified", "verified", "blocked"],
    },
    verifiedBy: { type: String, default: "" },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("BioData", bioDataSchema);
