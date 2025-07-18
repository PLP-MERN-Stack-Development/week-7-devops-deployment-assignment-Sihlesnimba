const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Signup route
router.post("/signup", async (req, res) => {
  const { username, pin } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const newUser = new User({ username, pin });
    await newUser.save();
    res.status(201).json({ userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Signup failed" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { username, pin } = req.body;
  try {
    const user = await User.findOne({ username, pin });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
