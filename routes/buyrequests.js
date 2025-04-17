const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth");

// Submit a new buy request
router.post("/", verifyToken, async (req, res) => {
  const buyer_username = req.user.username;
  const { item_id, contact_email, contact_phone, message } = req.body;

  console.log("[POST] New buy request from:", buyer_username, "for item:", item_id);

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
    console.log("[POST] Buy request inserted:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[POST] Error submitting buy request:", err);
    res.status(500).json({ message: "Failed to submit buy request" });
  }
});

// Get all buy requests for the logged-in seller
router.get("/seller", verifyToken, async (req, res) => {
  const seller = req.user.username;
  console.log("[GET] Logged-in seller:", seller);

  try {
    const result = await pool.query(
      `SELECT 
         br.id, br.buyer_username, br.contact_email, br.contact_phone, 
         br.message, br.request_status, br.item_id,
         i.title AS item_title, i.image AS item_image, 
         i.itemstatus AS item_status, i.seller_username
       FROM buy_requests br
       JOIN items i ON br.item_id = i.id
       WHERE LOWER(i.seller_username) = LOWER($1)
       ORDER BY br.requested_at DESC`,
      [seller]
    );

    console.log(`[GET] Returned ${result.rows.length} requests for seller "${seller}"`);
    res.json(result.rows);
  } catch (err) {
    console.error("[GET] Error fetching seller buy requests:", err);
    res.status(500).json({ message: "Failed to fetch buy requests" });
  }
});

// Accept a buy request and reject others
router.put("/:id/accept", verifyToken, async (req, res) => {
  const seller = req.user.username;
  const requestId = req.params.id;

  console.log(`[ACCEPT] Seller: ${seller} attempting to accept request ID: ${requestId}`);

  try {
    const validationQuery = `
      SELECT br.*, i.seller_username 
      FROM buy_requests br
      JOIN items i ON br.item_id = i.id
      WHERE br.id = $1 AND LOWER(i.seller_username) = LOWER($2)
    `;
    console.log("[ACCEPT] Executing validation query");

    const { rows: existing } = await pool.query(validationQuery, [requestId, seller]);

    if (existing.length === 0) {
      console.warn("[ACCEPT] No matching request or unauthorized.");
      return res.status(404).json({ message: "Buy request not found or unauthorized." });
    }

    const request = existing[0];
    const itemId = request.item_id;
    const buyerUsername = request.buyer_username;

    const acceptRes = await pool.query(
      `UPDATE buy_requests SET request_status = 'Accepted' WHERE id = $1 RETURNING *`,
      [requestId]
    );
    console.log(`[ACCEPT] Request ${requestId} accepted:`, acceptRes.rows[0]);

    const rejectRes = await pool.query(
      `UPDATE buy_requests SET request_status = 'Rejected' WHERE item_id = $1 AND id != $2 RETURNING id`,
      [itemId, requestId]
    );
    console.log(`[ACCEPT] Rejected other requests for item ${itemId}:`, rejectRes.rowCount);

    const itemUpdate = await pool.query(
      `UPDATE items SET itemstatus = 'On Hold', accepted_buyer = $1 WHERE id = $2 RETURNING *`,
      [buyerUsername, itemId]
    );
    console.log(`[ACCEPT] Item updated:`, itemUpdate.rows[0]);

    res.json({ message: "Buy request accepted. Item marked as On Hold." });
  } catch (err) {
    console.error("[ACCEPT] Error accepting buy request:", err);
    res.status(500).json({ message: "Failed to accept buy request", error: err.message });
  }
});

// Deny (reject) a specific request
router.put("/:id/status", verifyToken, async (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  if (!["Rejected", "Pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid status. Only 'Rejected' or 'Pending' allowed." });
  }

  try {
    const result = await pool.query(
      `UPDATE buy_requests SET request_status = $1 WHERE id = $2 RETURNING *`,
      [status, requestId]
    );

    if (result.rowCount === 0) {
      console.warn(`[STATUS] Request ${requestId} not found.`);
      return res.status(404).json({ message: "Buy request not found." });
    }

    console.log(`[STATUS] Request ${requestId} updated to ${status}`);
    res.json({ message: `Buy request marked as ${status}`, request: result.rows[0] });
  } catch (err) {
    console.error("[STATUS] Error updating request status:", err);
    res.status(500).json({ message: "Failed to update request status" });
  }
});

module.exports = router;
