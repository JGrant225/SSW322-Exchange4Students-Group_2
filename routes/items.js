const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth");

// Function to add items (POST)
router.post("/", verifyToken, async (req, res) => {
  const { title, description, price } = req.body;
  const seller_username = req.user.username;

  try {
    const result = await pool.query(
      "INSERT INTO items (title, description, price, seller_username) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, price, seller_username]
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
