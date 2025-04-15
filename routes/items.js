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
  const { title, description, price, category, dimensions, size, color } = req.body;
  const seller_username = req.user.username;
  const image = req.file ? req.file.filename : null;

  try {
    const result = await pool.query(
      "INSERT INTO items (title, description, price, seller_username, image, category, dimensions, size, color, itemstatus) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [title, description, price, seller_username, image, category, dimensions, size, color, itemstatus]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ message: "Failed to add item" });
  }
});

// Fetch all items
router.get("/", async (req, res) => {
  console.log("Query parameters received:", req.query);
  const { category, search } = req.query;

  try {
    // Start with a basic query
    let queryText = "SELECT * FROM items";
    const queryParams = [];
    const conditions = [];
    
    // Add category filter if provided
    if (category) {
      conditions.push(`category = $${queryParams.length + 1}`);
      queryParams.push(category);
    }
    
    // Add search terms if provided
    if (search && search.trim()) {
      const searchTerms = search.split(',').map(term => term.trim()).filter(Boolean);
      console.log("Parsed search terms:", searchTerms);
      
      if (searchTerms.length > 0) {
        // Create a combined search condition with OR operators
        const searchConditions = [];

        searchTerms.forEach(term => {
          const paramIndex = queryParams.length + 1;
          // Add size, color, and dimensions to search
          searchConditions.push(`(
            LOWER(title) LIKE $${paramIndex} OR 
            LOWER(description) LIKE $${paramIndex} OR 
            LOWER(COALESCE(size, '')) LIKE $${paramIndex} OR 
            LOWER(COALESCE(color, '')) LIKE $${paramIndex} OR 
            LOWER(COALESCE(dimensions, '')) LIKE $${paramIndex}
          )`);
          queryParams.push(`%${term.toLowerCase()}%`);
        });
        
        // Add the combined search condition
        conditions.push(`(${searchConditions.join(' OR ')})`);
      }
    }
    
    // Add WHERE clause if we have conditions
    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ");
    }
    
    // Add ordering
    queryText += " ORDER BY created_at DESC";
    
    console.log("Final SQL query:", queryText);
    console.log("Query parameters:", queryParams);
    
    // Execute the query
    const result = await pool.query(queryText, queryParams);
    console.log(`Query returned ${result.rows.length} items`);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error in GET /items:", err);
    res.status(500).json({ message: "Error fetching items", error: err.message });
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
  const { title, description, price, category, dimensions, size, color } = req.body;
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
    if (dimensions) {
      fields.push(`dimensions = $${index++}`);
      values.push(dimensions);
    }
    if (size) {
      fields.push(`size = $${index++}`);
      values.push(size);
    }
    if (color) {
      fields.push(`color = $${index++}`);
      values.push(color);
    }
    if (image) {
      fields.push(`image = $${index++}`);
      values.push(image);
    }
    if (itemstatus) {
      fields.push(`itemstatus = $${index++}`);
      values.push(itemstatus);
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