const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth");

// Add item to cart (prevent duplicates)
router.post("/add", verifyToken, async (req, res) => {
  const buyer_username = req.user.username;
  const { itemId } = req.body;

  console.log("[POST] /cart/add", { buyer_username, itemId });

  if (!itemId) {
    return res.status(400).json({ message: "Missing itemId in request body" });
  }

  try {
    // Check if item is already in the cart
    const existing = await pool.query(
      `SELECT * FROM cart_items WHERE buyer_username = $1 AND item_id = $2`,
      [buyer_username, itemId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Item already in cart" });
    }

    // Insert if not already in cart
    await pool.query(
      `INSERT INTO cart_items (buyer_username, item_id)
       VALUES ($1, $2)`,
      [buyer_username, itemId]
    );

    res.status(201).json({ message: "Item added to cart" });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

// View cart
router.get("/", verifyToken, async (req, res) => {
  const buyer_username = req.user.username;

  try {
    const result = await pool.query(
      `SELECT items.*
       FROM cart_items
       JOIN items ON cart_items.item_id = items.id
       WHERE cart_items.buyer_username = $1`,
      [buyer_username]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Failed to fetch cart items" });
  }
});

// Remove item from cart
router.delete("/:itemId", verifyToken, async (req, res) => {
  const buyer_username = req.user.username;
  const itemId = req.params.itemId;

  try {
    await pool.query(
      `DELETE FROM cart_items
       WHERE buyer_username = $1 AND item_id = $2`,
      [buyer_username, itemId]
    );
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Error removing item:", err);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
});

// Checkout - clear all items for user
router.post("/checkout", verifyToken, async (req, res) => {
  const buyer_username = req.user.username;

  try {
    await pool.query(
      `DELETE FROM cart_items WHERE buyer_username = $1`,
      [buyer_username]
    );
    res.json({ message: "Checkout successful. Cart cleared." });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Checkout failed" });
  }
});

module.exports = router;
