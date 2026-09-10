const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "admin@gmail.com";
    const password = "Admin@123";
    const name = "System Admin";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      existingAdmin.role = "admin";

      await existingAdmin.save();

      console.log("Existing user converted to admin");
      console.log("Email:", email);
      console.log("Password:", password);

      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created successfully");
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);

  } catch (error) {
    console.error("Admin creation error:", error);
    process.exit(1);
  }
}

createAdmin();