const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Temporary in-memory user storage (replace with DB later)
let users = [];

// Register
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Registering user:", username);

        const existingUser = users.find((u) => u.username === username);
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error in /register:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Logging in:", username);

        const user = users.find((u) => u.username === username);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "12h" });
        res.json({ token });
    } catch (err) {
        console.error("Error in /login:", err);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
