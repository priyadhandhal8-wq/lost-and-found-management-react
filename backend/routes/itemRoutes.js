const express = require("express");
const mongoose = require("mongoose");

const Item = require("../models/Item");
const Claim = require("../models/Claim");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

// ==========================================
// CREATE LOST / FOUND ITEM
// ==========================================

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        itemName,
        description,
        category,
        location,
        date,
        type,
      } = req.body;

      if (
        !itemName ||
        !description ||
        !category ||
        !location ||
        !date ||
        !type
      ) {
        return res.status(400).json({
          message: "All required fields must be filled",
        });
      }

      const item = await Item.create({
        itemName,
        description,
        category,
        location,
        date,
        type,
        image: req.file ? req.file.filename : "",
        reportedBy: req.userId,
      });

      res.status(201).json({
        message: "Item reported successfully",
        item,
      });
    } catch (error) {
      console.log("CREATE ITEM ERROR:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==========================================
// GET ALL ITEMS
// HIDE ITEMS WHOSE CLAIM IS APPROVED
// ==========================================

router.get("/", async (req, res) => {
  try {
    // Get all items
    const items = await Item.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    // Get all approved claims
    const approvedClaims = await Claim.find({
      status: "Approved",
    }).select("item");

    // Create list of item IDs whose claim is approved
    const approvedItemIds = approvedClaims.map(
      (claim) => claim.item.toString()
    );

    // Remove items having approved claims
    const filteredItems = items.filter(
      (item) =>
        !approvedItemIds.includes(item._id.toString())
    );

    res.json(filteredItems);
  } catch (error) {
    console.log("GET ALL ITEMS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==========================================
// GET MY ITEMS
// ==========================================

router.get("/my-items", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({
      reportedBy: req.userId,
    }).sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.log("GET MY ITEMS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==========================================
// UPDATE ITEM
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({
          message: "Item not found",
        });
      }

      // Only owner can update
      if (item.reportedBy.toString() !== req.userId.toString()) {
        return res.status(403).json({
          message: "You can only update your own items",
        });
      }

      const {
        itemName,
        description,
        category,
        location,
        date,
        type,
      } = req.body;

      // Update normal fields
      item.itemName = itemName;
      item.description = description;
      item.category = category;
      item.location = location;
      item.date = date;
      item.type = type;

      // ==========================================
      // IMAGE UPDATE / REMOVE
      // ==========================================

      if (req.file) {
        // New image selected
        item.image = req.file.filename;
      } else if (req.body.removeImage === "true") {
        // Remove current image
        item.image = "";
      }

      await item.save();

      res.json({
        message: "Item updated successfully",
        item,
      });
    } catch (error) {
      console.log("UPDATE ITEM ERROR:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==========================================
// DELETE ITEM
// ==========================================

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.reportedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You can only delete your own items",
      });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.log("DELETE ITEM ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==========================================
// FIND MATCHING ITEMS
// IMPORTANT: This must come BEFORE /:id
// ==========================================

router.get("/:id/matches", authMiddleware, async (req, res) => {
  try {
    // Check valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid item ID",
      });
    }

    // Get original item
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Lost -> Find Found
    // Found -> Find Lost
    const oppositeType =
      item.type === "Lost" ? "Found" : "Lost";

    const matchingItems = await Item.find({
      type: oppositeType,
      status: "Active",
      _id: { $ne: item._id },
    }).sort({ createdAt: -1 });

    // ==========================================
    // NORMALIZE TEXT
    // ==========================================

    const normalize = (text) => {
      return (text || "")
        .toLowerCase()
        .trim();
    };

    const itemName = normalize(item.itemName);
    const itemCategory = normalize(item.category);
    const itemLocation = normalize(item.location);
    const itemDescription = normalize(item.description);

    // ==========================================
    // CALCULATE MATCH SCORE
    // ==========================================

    const results = matchingItems.map((match) => {
      let score = 0;

      const matchName = normalize(match.itemName);
      const matchCategory = normalize(match.category);
      const matchLocation = normalize(match.location);
      const matchDescription = normalize(match.description);

      // ==========================================
      // ITEM NAME - 40%
      // ==========================================

      if (itemName && matchName) {
        if (itemName === matchName) {
          score += 40;
        } else if (
          itemName.includes(matchName) ||
          matchName.includes(itemName)
        ) {
          score += 30;
        }
      }

      // ==========================================
      // CATEGORY - 25%
      // ==========================================

      if (
        itemCategory &&
        matchCategory &&
        itemCategory === matchCategory
      ) {
        score += 25;
      }

      // ==========================================
      // LOCATION - 20%
      // ==========================================

      if (itemLocation && matchLocation) {
        if (itemLocation === matchLocation) {
          score += 20;
        } else if (
          itemLocation.includes(matchLocation) ||
          matchLocation.includes(itemLocation)
        ) {
          score += 12;
        }
      }

      // ==========================================
      // DESCRIPTION - 15%
      // ==========================================

      if (itemDescription && matchDescription) {
        const words = itemDescription
          .split(/\s+/)
          .filter((word) => word.length > 3);

        let matchedWords = 0;

        words.forEach((word) => {
          if (matchDescription.includes(word)) {
            matchedWords++;
          }
        });

        if (words.length > 0) {
          const descriptionScore =
            (matchedWords / words.length) * 15;

          score += Math.round(descriptionScore);
        }
      }

      return {
        ...match.toObject(),
        matchScore: Math.min(score, 100),
      };
    });

    // ==========================================
    // FILTER & SORT
    // ==========================================

    const filteredResults = results
      .filter((item) => item.matchScore >= 30)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      originalItem: item,
      matches: filteredResults,
    });

  } catch (error) {
    console.error("MATCH ERROR:", error);

    res.status(500).json({
      message: "Unable to find matching items",
      error: error.message,
    });
  }
});

// ==========================================
// GET SINGLE ITEM DETAILS
// IMPORTANT: Keep this AFTER /:id/matches
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    // Check MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid item ID",
      });
    }

    const item = await Item.findById(req.params.id)
      .populate("reportedBy", "name email");

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("GET ITEM ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;