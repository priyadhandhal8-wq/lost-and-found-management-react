
const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    // Item being claimed
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    // User who is claiming the item
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Claim message
    message: {
      type: String,
      required: true,
    },

    // Claim status
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    // Contact number sharing status
    contactRequestStatus: {
      type: String,
      enum: ["None", "Requested", "Shared", "Declined"],
      default: "None",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Claim", claimSchema);

