const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    postId: {
      type: String,
      default: null,
    },

    reportType: {
      type: String,
      enum: ["user", "post"],
      required: true,
    },

    reason: {
      type: String,
      required: true,
      enum: [
        "Harassment or bullying",
        "Spam",
        "Fake account",
        "Impersonation",
        "Hateful content",
        "Inappropriate content",
        "Scam or fraud",
        "Other",
      ],
    },

    details: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);