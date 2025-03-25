const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configure multer to store images in the uploads/folder with unique filenames
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    // Save as timestamp + extension
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Initialize multer with the storage config
const upload = multer({ storage });

// Function to add items (POST) with optional image
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  const { title, description, price } = req.body;
  const seller_username = req.user.username;
  const image = req.file ? req.file.filename : null;

  try {
    const result = await pool.query(
      "INSERT INTO items (title, description, price, seller_username, image) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, price, seller_username, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ message: "Failed to add item" });
  }
});

// Function to get items (GET)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

module.exports = router;
