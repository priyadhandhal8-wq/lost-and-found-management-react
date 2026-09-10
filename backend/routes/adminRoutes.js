const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../models/User");
const Item = require("../models/Item");
const Claim = require("../models/Claim");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


// =====================================================
// ADMIN LOGIN
// POST /api/admin/login
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const admin = await User.findOne({ email });

    if (!admin) {
      return res.status(400).json({
        message: "Invalid admin email or password",
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid admin email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: admin._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});

// =====================================================
// TEST ADMIN ROUTE
// GET /api/admin/test
// =====================================================

router.get("/test", (req, res) => {
  res.json({
    message: "Admin route is working",
  });
});
// =====================================================
// CREATE USER
// POST /api/admin/users
// =====================================================

router.post(
  "/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Name, email and password are required",
        });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "user",
      });

      return res.status(201).json({
        message: "User created successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("CREATE USER ERROR:", error);

      return res.status(500).json({
        message: "Failed to create user",
      });
    }
  }
);

// =====================================================
// GET ALL USERS
// GET /api/admin/users
// =====================================================

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      return res.status(200).json(users);
    } catch (error) {
      console.error("GET USERS ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch users",
      });
    }
  }
);
// =====================================================
// UPDATE USER
// PUT /api/admin/users/:id
// =====================================================

router.put(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { name, email, role } = req.body;

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;

      await user.save();

      return res.status(200).json({
        message: "User updated successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("UPDATE USER ERROR:", error);

      return res.status(500).json({
        message: "Failed to update user",
      });
    }
  }
);

// =====================================================
// DELETE USER
// DELETE /api/admin/users/:id
// =====================================================

router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      await User.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("DELETE USER ERROR:", error);

      return res.status(500).json({
        message: "Failed to delete user",
      });
    }
  }
);
// =====================================================
// CREATE ITEM
// POST /api/admin/items
// =====================================================

router.post(
  "/items",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        itemName,
        description,
        category,
        location,
        date,
        type,
        reportedBy,
        status,
      } = req.body;

      if (
        !itemName ||
        !description ||
        !category ||
        !location ||
        !date ||
        !type ||
        !reportedBy
      ) {
        return res.status(400).json({
          message: "All required fields are required",
        });
      }

      const user = await User.findById(reportedBy);

      if (!user) {
        return res.status(404).json({
          message: "Reported user not found",
        });
      }

      const item = await Item.create({
        itemName,
        description,
        category,
        location,
        date,
        type,
        reportedBy,
        status: status || "Active",
      });

      const populatedItem = await Item.findById(item._id)
        .populate("reportedBy", "name email");

      return res.status(201).json({
        message: "Item created successfully",
        item: populatedItem,
      });
    } catch (error) {
      console.error("CREATE ITEM ERROR:", error);

      return res.status(500).json({
        message: "Failed to create item",
      });
    }
  }
);

// =====================================================
// GET ALL ITEMS
// GET /api/admin/items
// =====================================================

router.get(
  "/items",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const items = await Item.find()
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json(items);
    } catch (error) {
      console.error("GET ITEMS ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch items",
      });
    }
  }
);

// =====================================================
// UPDATE ITEM
// PUT /api/admin/items/:id
// =====================================================

router.put(
  "/items/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        itemName,
        description,
        category,
        location,
        date,
        type,
        reportedBy,
        status,
      } = req.body;

      const item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({
          message: "Item not found",
        });
      }

      if (reportedBy) {
        const user = await User.findById(reportedBy);

        if (!user) {
          return res.status(404).json({
            message: "Reported user not found",
          });
        }

        item.reportedBy = reportedBy;
      }

      if (itemName) item.itemName = itemName;
      if (description) item.description = description;
      if (category) item.category = category;
      if (location) item.location = location;
      if (date) item.date = date;
      if (type) item.type = type;
      if (status) item.status = status;

      await item.save();

      const updatedItem = await Item.findById(item._id)
        .populate("reportedBy", "name email");

      return res.status(200).json({
        message: "Item updated successfully",
        item: updatedItem,
      });
    } catch (error) {
      console.error("UPDATE ITEM ERROR:", error);

      return res.status(500).json({
        message: "Failed to update item",
      });
    }
  }
);
// =====================================================
// DELETE ITEM
// DELETE /api/admin/items/:id
// =====================================================

router.delete(
  "/items/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({
          message: "Item not found",
        });
      }

      await Item.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        message: "Item deleted successfully",
      });
    } catch (error) {
      console.error("DELETE ITEM ERROR:", error);

      return res.status(500).json({
        message: "Failed to delete item",
      });
    }
  }
);
// =====================================================
// CREATE CLAIM - ADMIN
// POST /api/admin/claims
// =====================================================

router.post(
  "/claims",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        item,
        claimedBy,
        message,
        status,
      } = req.body;

      if (!item || !claimedBy || !message) {
        return res.status(400).json({
          message:
            "Item, claimed user and message are required",
        });
      }

      const existingItem = await Item.findById(item);

      if (!existingItem) {
        return res.status(404).json({
          message: "Item not found",
        });
      }

      const existingUser = await User.findById(claimedBy);

      if (!existingUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const existingClaim = await Claim.findOne({
        item,
        claimedBy,
      });

      if (existingClaim) {
        return res.status(400).json({
          message:
            "This user has already claimed this item",
        });
      }

      const claim = await Claim.create({
        item,
        claimedBy,
        message,
        status: status || "Pending",
      });

      const populatedClaim = await Claim.findById(
        claim._id
      )
        .populate("item")
        .populate("claimedBy", "name email");

      return res.status(201).json({
        message: "Claim created successfully",
        claim: populatedClaim,
      });
    } catch (error) {
      console.error(
        "CREATE ADMIN CLAIM ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to create claim",
      });
    }
  }
);
// =====================================================
// GET ALL CLAIMS
// GET /api/admin/claims
// =====================================================

router.get(
  "/claims",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const claims = await Claim.find()
        .populate("item")
        .populate("claimedBy", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json(claims);
    } catch (error) {
      console.error("GET CLAIMS ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch claims",
      });
    }
  }
);
// =====================================================
// UPDATE CLAIM
// PUT /api/admin/claims/:id
// =====================================================

router.put(
  "/claims/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { message, status } = req.body;

      const claim = await Claim.findById(req.params.id);

      if (!claim) {
        return res.status(404).json({
          message: "Claim not found",
        });
      }

      if (message !== undefined) {
        claim.message = message;
      }

      if (status !== undefined) {
        claim.status = status;
      }

      await claim.save();

      const updatedClaim = await Claim.findById(claim._id)
        .populate("item")
        .populate("claimedBy", "name email");

      // If approved, mark item as claimed
      if (status === "Approved") {
        await Item.findByIdAndUpdate(claim.item._id, {
          status: "Claimed",
        });
      }

      return res.status(200).json({
        message: "Claim updated successfully",
        claim: updatedClaim,
      });
    } catch (error) {
      console.error("UPDATE CLAIM ERROR:", error);

      return res.status(500).json({
        message: "Failed to update claim",
      });
    }
  }
);

// =====================================================
// APPROVE CLAIM
// PUT /api/admin/claims/:id/approve
// =====================================================

router.put(
  "/claims/:id/approve",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const claim = await Claim.findById(req.params.id)
        .populate("item");

      if (!claim) {
        return res.status(404).json({
          message: "Claim not found",
        });
      }

      claim.status = "Approved";
      await claim.save();

      await Item.findByIdAndUpdate(claim.item._id, {
        status: "Claimed",
      });

      return res.status(200).json({
        message: "Claim approved successfully",
        claim,
      });
    } catch (error) {
      console.error("APPROVE CLAIM ERROR:", error);

      return res.status(500).json({
        message: "Failed to approve claim",
      });
    }
  }
);


// =====================================================
// REJECT CLAIM
// PUT /api/admin/claims/:id/reject
// =====================================================

router.put(
  "/claims/:id/reject",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const claim = await Claim.findById(req.params.id);

      if (!claim) {
        return res.status(404).json({
          message: "Claim not found",
        });
      }

      claim.status = "Rejected";
      await claim.save();

      return res.status(200).json({
        message: "Claim rejected successfully",
        claim,
      });
    } catch (error) {
      console.error("REJECT CLAIM ERROR:", error);

      return res.status(500).json({
        message: "Failed to reject claim",
      });
    }
  }
);

// =====================================================
// DELETE CLAIM
// DELETE /api/admin/claims/:id
// =====================================================

router.delete(
  "/claims/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const claim = await Claim.findById(
        req.params.id
      );

      if (!claim) {
        return res.status(404).json({
          message: "Claim not found",
        });
      }

      await Claim.findByIdAndDelete(
        req.params.id
      );

      return res.status(200).json({
        message: "Claim deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE CLAIM ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to delete claim",
      });
    }
  }
);
// =====================================================
// ADMIN DASHBOARD STATS
// GET /api/admin/stats
// =====================================================

router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalItems = await Item.countDocuments();

      const lostItems = await Item.countDocuments({
        type: "Lost",
      });

      const foundItems = await Item.countDocuments({
        type: "Found",
      });

      const totalClaims = await Claim.countDocuments();

      return res.status(200).json({
        users: totalUsers,
        items: totalItems,
        lostItems: lostItems,
        foundItems: foundItems,
        claims: totalClaims,
      });
    } catch (error) {
      console.error("STATS ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch dashboard statistics",
      });
    }
  }
);
// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;