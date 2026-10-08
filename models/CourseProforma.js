const mongoose = require("mongoose");

const courseProformaSchema = new mongoose.Schema(
  {
    reference: { type: String, trim: true, default: "" },
    courseName: { type: String, required: true, trim: true },
    batchName: { type: String, trim: true, default: "" },
    trainingDays: { type: Number, default: 0 },
    fromDate: { type: String, default: "" },
    toDate: { type: String, default: "" },
    participantLevel: { type: String, default: "" },
    totalStrength: { type: Number, default: 0 },

    // RPF Zones
    wr: { type: Number, default: 0 },
    cr: { type: Number, default: 0 },
    nr: { type: Number, default: 0 },
    nwr: { type: Number, default: 0 },
    ecr: { type: Number, default: 0 },
    scr: { type: Number, default: 0 },
    sr: { type: Number, default: 0 },
    ner: { type: Number, default: 0 },
    swr: { type: Number, default: 0 },
    wcr: { type: Number, default: 0 },
    ecor: { type: Number, default: 0 },
    ncr: { type: Number, default: 0 },
    er: { type: Number, default: 0 },
    ser: { type: Number, default: 0 },
    secr: { type: Number, default: 0 },
    nfr: { type: Number, default: 0 },
    scor: { type: Number, default: 0 },
    metro: { type: Number, default: 0 },
    dlwPu: { type: Number, default: 0 },
    clwPu: { type: Number, default: 0 },
    icfPu: { type: Number, default: 0 },
    rcfKxhPu: { type: Number, default: 0 },
    dmwPu: { type: Number, default: 0 },
    rwfPu: { type: Number, default: 0 },
    rblKxhPu: { type: Number, default: 0 },
    rwpPu: { type: Number, default: 0 },
    totalFromRPF: { type: Number, default: 0 },

    // RPSF Battalions
    bn1: { type: Number, default: 0 },
    bn2: { type: Number, default: 0 },
    bn3: { type: Number, default: 0 },
    bn4: { type: Number, default: 0 },
    bn5: { type: Number, default: 0 },
    bn6: { type: Number, default: 0 },
    bn7: { type: Number, default: 0 },
    bn8: { type: Number, default: 0 },
    bn9: { type: Number, default: 0 },
    bn10: { type: Number, default: 0 },
    bn11: { type: Number, default: 0 },
    bn12: { type: Number, default: 0 },
    bn14: { type: Number, default: 0 },
    bn15: { type: Number, default: 0 },
    totalFromRPSF: { type: Number, default: 0 },

    grandTotalArrival: { type: Number, default: 0 },

    // Shortfall
    shortfallRPF: { type: Number, default: 0 },
    shortfallRPSF: { type: Number, default: 0 },
    grandTotalShortfall: { type: Number, default: 0 },

    // Excess
    excessRPF: { type: Number, default: 0 },
    excessRPSF: { type: Number, default: 0 },
    grandTotalExcess: { type: Number, default: 0 },

    // Ranks
    ipf: { type: Number, default: 0 },
    sipf: { type: Number, default: 0 },
    asi: { type: Number, default: 0 },
    hc: { type: Number, default: 0 },
    ct: { type: Number, default: 0 },
    ctR: { type: Number, default: 0 },

    // Gender
    male: { type: Number, default: 0 },
    female: { type: Number, default: 0 },

    // Training
    attended: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    certificateIssued: { type: Number, default: 0 },

    remarks: { type: String, default: "" },

    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CourseProforma", courseProformaSchema);
