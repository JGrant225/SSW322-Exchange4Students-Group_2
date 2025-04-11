const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configure image storage using multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Add new item with optional image and category
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  const { title, description, price, category } = req.body;
  const seller_username = req.user.username;
  const image = req.file ? req.file.filename : null;

  try {
    const result = await pool.query(
      "INSERT INTO items (title, description, price, seller_username, image, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, price, seller_username, image, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ message: "Failed to add item" });
  }
});

// Fetch all items
router.get("/", async (req, res) => {
  const { category, search } = req.query;

  let query = "SELECT * FROM items";
  const where = [];
  const values = [];
  let index = 1;

  if (category) {
    where.push(`category = $${index++}`);
    values.push(category);
  }

  if (search) {
    where.push(`(LOWER(title) LIKE $${index} OR LOWER(description) LIKE $${index})`);
    values.push(`%${search.toLowerCase()}%`);
    index++;
  }

  if (where.length > 0) {
    query += " WHERE " + where.join(" AND ");
  }

  query += " ORDER BY created_at DESC";
  
  try {
    console.log("Executing query: ", query);
    console.log("With values:", values);
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// Return items posted by the logged-in seller
router.get("/mine", verifyToken, async (req, res) => {
  const seller = req.user.username;
  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE seller_username = $1 ORDER BY created_at DESC",
      [seller]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching seller items:", err);
    res.status(500).json({ message: "Failed to fetch seller items" });
  }
});

// Delete an item posted by the logged-in seller
router.delete("/:id", verifyToken, async (req, res) => {
  const seller = req.user.username;
  const itemId = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 AND seller_username = $2 RETURNING *",
      [itemId, seller]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Not authorized or item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

// Update an item posted by the logged-in seller (including optional new image or category)
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  const itemId = req.params.id;
  const seller_username = req.user.username;
  const { title, description, price, category } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const existingItem = await pool.query(
      "SELECT * FROM items WHERE id = $1 AND seller_username = $2",
      [itemId, seller_username]
    );

    if (existingItem.rows.length === 0) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (title) {
      fields.push(`title = $${index++}`);
      values.push(title);
    }
    if (description) {
      fields.push(`description = $${index++}`);
      values.push(description);
    }
    if (price) {
      fields.push(`price = $${index++}`);
      values.push(price);
    }
    if (category) {
      fields.push(`category = $${index++}`);
      values.push(category);
    }
    if (image) {
      fields.push(`image = $${index++}`);
      values.push(image);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(itemId);
    values.push(seller_username);

    const updateQuery = `
      UPDATE items
      SET ${fields.join(", ")}
      WHERE id = $${index++} AND seller_username = $${index}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ message: "Failed to update item" });
  }
});

module.exports = router;