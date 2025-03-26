const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

console.log("POOL TYPE:", typeof pool.query);

// Register
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Check if user already exists in DB
        const existingUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into DB
        await pool.query(
            "INSERT INTO users (username, password) VALUES ($1, $2)",
            [username, hashedPassword]
        );

        console.log(`User registered: ${username}`);
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

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Look up user in DB
        const userQuery = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = userQuery.rows[0];

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "12h" });

        console.log(`User logged in: ${username}`);
        res.json({ message: "Login successful", token });
    } catch (err) {
        console.error("Error in /login:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
