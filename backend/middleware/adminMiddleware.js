const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function adminMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    req.userId = user._id;
    req.user = user;

    next();

  } catch (error) {
    console.log("Admin Middleware Error:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

module.exports = adminMiddleware;