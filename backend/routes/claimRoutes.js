
const express = require("express");

const Claim = require("../models/Claim");
const Item = require("../models/Item");
const Notification = require("../models/Notification");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// CREATE CLAIM
// =====================================================

router.post("/:itemId", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Claim message is required",
      });
    }

    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // User cannot claim their own item
    if (item.reportedBy.toString() === req.userId.toString()) {
      return res.status(400).json({
        message: "You cannot claim your own item",
      });
    }

    // Check existing claim
    const existingClaim = await Claim.findOne({
      item: req.params.itemId,
      claimedBy: req.userId,
    });

    if (existingClaim) {
      return res.status(400).json({
        message: "You have already claimed this item",
      });
    }

    // Create claim
    const claim = await Claim.create({
      item: req.params.itemId,
      claimedBy: req.userId,
      message: message.trim(),
      status: "Pending",
      contactRequestStatus: "None",
    });

    // Notify item owner
    await Notification.create({
      recipient: item.reportedBy,
      type: "NEW_CLAIM",
      title: "New Claim Received",
      message: "Someone has submitted a claim for your item.",
      relatedItem: item._id,
      relatedClaim: claim._id,
    });

    res.status(201).json({
      message: "Claim submitted successfully",
      claim,
    });

  } catch (error) {
    console.log("CREATE CLAIM ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// =====================================================
// GET MY CLAIMS
// =====================================================

router.get("/my-claims", authMiddleware, async (req, res) => {
  try {
    const claims = await Claim.find({
      claimedBy: req.userId,
    })
      .populate("item")
      .sort({ createdAt: -1 });

    res.json(claims);

  } catch (error) {
    console.log("MY CLAIMS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// =====================================================
// GET CLAIMS RECEIVED FOR MY ITEMS
// =====================================================

router.get("/received", authMiddleware, async (req, res) => {
  try {
    const myItems = await Item.find({
      reportedBy: req.userId,
    }).select("_id");

    const itemIds = myItems.map((item) => item._id);

    const claims = await Claim.find({
      item: { $in: itemIds },
    })
      .populate("item")
      .populate("claimedBy", "name email phone")
      .sort({ createdAt: -1 });

    res.json(claims);

  } catch (error) {
    console.log("RECEIVED CLAIMS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// =====================================================
// APPROVE CLAIM
// =====================================================

router.put("/:claimId/approve", authMiddleware, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId)
      .populate("item");

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    // Only item owner can approve
    if (
      claim.item.reportedBy.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message: "You can only manage claims on your own items",
      });
    }

    // Update claim status
    claim.status = "Approved";

    // Reset contact request state
    claim.contactRequestStatus = "None";

    await claim.save();

    // Update item status
    await Item.findByIdAndUpdate(claim.item._id, {
      status: "Claimed",
    });

    // Notify claimant
    await Notification.create({
      recipient: claim.claimedBy,
      type: "CLAIM_APPROVED",
      title: "Claim Approved",
      message: "Your claim has been approved.",
      relatedItem: claim.item._id,
      relatedClaim: claim._id,
    });

    res.json({
      message: "Claim approved successfully",
      claim,
    });

  } catch (error) {
    console.log("APPROVE CLAIM ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// =====================================================
// REJECT CLAIM
// =====================================================

router.put("/:claimId/reject", authMiddleware, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId)
      .populate("item");

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    // Only item owner can reject
    if (
      claim.item.reportedBy.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message: "You can only manage claims on your own items",
      });
    }

    // Update claim status
    claim.status = "Rejected";
    claim.contactRequestStatus = "None";

    await claim.save();

    // Notify claimant
    await Notification.create({
      recipient: claim.claimedBy,
      type: "CLAIM_REJECTED",
      title: "Claim Rejected",
      message: "Your claim has been rejected.",
      relatedItem: claim.item._id,
      relatedClaim: claim._id,
    });

    res.json({
      message: "Claim rejected successfully",
      claim,
    });

  } catch (error) {
    console.log("REJECT CLAIM ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// =====================================================
// REQUEST OWNER'S CONTACT NUMBER
// =====================================================

router.post("/:claimId/contact-request", authMiddleware, async (req, res) => {
  console.log("CONTACT REQUEST HIT");
console.log("Claim ID:", req.params.claimId);
console.log("User ID:", req.userId);
  try {
    const claim = await Claim.findById(req.params.claimId)
      .populate("item");
      console.log("CLAIM FOUND:", claim);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    // Only claimant can request contact number
    if (
      claim.claimedBy.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message: "You can only request contact for your own claim",
      });
    }

    // Contact request only after approval
    if (claim.status !== "Approved") {
      return res.status(400).json({
        message: "Contact number can only be requested after claim approval",
      });
    }

    // Already shared
    if (claim.contactRequestStatus === "Shared") {
      return res.status(400).json({
        message: "Contact number has already been shared",
      });
    }

    // Already requested
    if (claim.contactRequestStatus === "Requested") {
      return res.status(400).json({
        message: "Contact number request is already pending",
      });
    }

    claim.contactRequestStatus = "Requested";

    await claim.save();

    // Notify item owner
    await Notification.create({
      recipient: claim.item.reportedBy,
      type: "CONTACT_REQUEST",
      title: "Contact Number Requested",
      message: "The claimant has requested your contact number.",
      relatedItem: claim.item._id,
      relatedClaim: claim._id,
    });

    res.json({
      message: "Contact number request sent successfully",
      claim,
    });

  } catch (error) {
    console.log("CONTACT REQUEST ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// =====================================================
// OWNER SHARES CONTACT NUMBER
// =====================================================

router.put("/:claimId/contact-share", authMiddleware, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId)
      .populate("item");

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    // Only item owner can share
    if (
      claim.item.reportedBy.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message: "Only the item owner can share the contact number",
      });
    }

    // Request must exist
    if (claim.contactRequestStatus !== "Requested") {
      return res.status(400).json({
        message: "There is no pending contact request",
      });
    }

    claim.contactRequestStatus = "Shared";

    await claim.save();

    // Notify claimant
    await Notification.create({
      recipient: claim.claimedBy,
      type: "CONTACT_SHARED",
      title: "Contact Number Shared",
      message: "The item owner has shared their contact number with you.",
      relatedItem: claim.item._id,
      relatedClaim: claim._id,
    });

    res.json({
      message: "Contact number shared successfully",
      claim,
    });

  } catch (error) {
    console.log("CONTACT SHARE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// =====================================================
// OWNER DECLINES CONTACT NUMBER
// =====================================================

router.put("/:claimId/contact-decline", authMiddleware, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId)
      .populate("item");

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    // Only item owner can decline
    if (
      claim.item.reportedBy.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message: "Only the item owner can decline the contact request",
      });
    }

    // Request must exist
    if (claim.contactRequestStatus !== "Requested") {
      return res.status(400).json({
        message: "There is no pending contact request",
      });
    }

    claim.contactRequestStatus = "Declined";

    await claim.save();

    // Notify claimant
    await Notification.create({
      recipient: claim.claimedBy,
      type: "CONTACT_DECLINED",
      title: "Contact Number Request Declined",
      message: "The item owner has declined to share their contact number.",
      relatedItem: claim.item._id,
      relatedClaim: claim._id,
    });

    res.json({
      message: "Contact request declined",
      claim,
    });

  } catch (error) {
    console.log("CONTACT DECLINE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// =====================================================
// GET SHARED CONTACT NUMBER
// =====================================================

router.get("/:claimId/contact", authMiddleware, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId)
      .populate("item");

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    // Only claimant can view the owner's contact
    if (
      claim.claimedBy.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        message: "You cannot view this contact number",
      });
    }

    // Contact must have been shared
    if (claim.contactRequestStatus !== "Shared") {
      return res.status(403).json({
        message: "Contact number has not been shared yet",
      });
    }

    // Get item owner
    const owner = await User.findById(claim.item.reportedBy)
      .select("name phone");

    if (!owner) {
      return res.status(404).json({
        message: "Item owner not found",
      });
    }

    if (!owner.phone) {
      return res.status(404).json({
        message: "Item owner has not added a phone number",
      });
    }

    res.json({
      name: owner.name,
      phone: owner.phone,
    });

  } catch (error) {
    console.log("GET CONTACT ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


module.exports = router;

