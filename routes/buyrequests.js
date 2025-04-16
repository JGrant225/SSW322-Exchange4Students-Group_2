const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth");

// Submit a new buy request
router.post("/", verifyToken, async (req, res) => {
  const buyer_username = req.user.username;
  const { item_id, contact_email, contact_phone, message } = req.body;

  // Debug log of incoming request
  console.log("Received buy request:", {
    buyer_username,
    item_id,
    contact_email,
    contact_phone,
    message,
  });

  // Basic input validation
  if (!item_id || !contact_email || !contact_phone) {
    return res.status(400).json({
      message: "Missing required fields: item_id, contact_email, or contact_phone",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO buy_requests (buyer_username, item_id, contact_email, contact_phone, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [buyer_username, item_id, contact_email, contact_phone, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error submitting buy request:", err);
    res.status(500).json({ message: "Failed to submit buy request" });
  }
});

// Get all buy requests for the logged-in seller
router.get("/seller", verifyToken, async (req, res) => {
  const seller = req.user.username;

  try {
    const result = await pool.query(
      `SELECT br.*, i.title, i.image, i.itemstatus
       FROM buy_requests br
       JOIN items i ON br.item_id = i.id
       WHERE i.seller_username = $1
       ORDER BY br.requested_at DESC`,
      [seller]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching seller buy requests:", err);
    res.status(500).json({ message: "Failed to fetch buy requests" });
  }
});

// Update a buy request's status
router.put("/:id/status", verifyToken, async (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE buy_requests
       SET request_status = $1
       WHERE id = $2
       RETURNING *`,
      [status, requestId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Buy request not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating request status:", err);
    res.status(500).json({ message: "Failed to update request status" });
  }
});

module.exports = router;
