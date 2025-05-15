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
         AND (br.cleared_by_seller IS FALSE OR br.cleared_by_seller IS NULL)
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

// Get all buy requests for the logged-in buyer
router.get("/buyer", verifyToken, async (req, res) => {
  const buyer = req.user.username;
  console.log("[GET] Buyer checking requests:", buyer);

  try {
    const result = await pool.query(
      `SELECT 
         br.id, br.item_id, br.request_status, br.requested_at,
         i.title AS item_title, i.image AS item_image, i.itemstatus
       FROM buy_requests br
       JOIN items i ON br.item_id = i.id
       WHERE br.buyer_username = $1 AND (br.cleared_by_buyer IS FALSE OR br.cleared_by_buyer IS NULL)
       ORDER BY br.requested_at DESC`,
      [buyer]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("[GET] Error fetching buyer requests:", err);
    res.status(500).json({ message: "Failed to fetch buyer requests" });
  }
});

// Delete a buy request
router.delete("/:id", verifyToken, async (req, res) => {
  const buyer = req.user.username;
  const requestId = req.params.id;
  
  console.log(`[DELETE] Buyer: ${buyer} attempting to delete request ID: ${requestId}`);
  
  try {
    // First check if this request belongs to this buyer
    const checkQuery = await pool.query(
      `SELECT * FROM buy_requests WHERE id = $1 AND buyer_username = $2`,
      [requestId, buyer]
    );
    
    if (checkQuery.rows.length === 0) {
      console.warn(`[DELETE] Request ${requestId} not found or doesn't belong to ${buyer}`);
      return res.status(404).json({ 
        message: "Buy request not found or you don't have permission to delete it." 
      });
    }
    
    // Allow cancellation even if accepted — mark as "Cancelled"
    const cancelResult = await pool.query(
      `UPDATE buy_requests SET request_status = 'Cancelled' WHERE id = $1 RETURNING *`,
      [requestId]
    );

    console.log(`[DELETE] Soft-cancelled request ${requestId}`);
    return res.json({ 
      message: "Buy request cancelled successfully",
      cancelledRequest: cancelResult.rows[0]
    });
    
    // Delete the request
    const deleteResult = await pool.query(
      `DELETE FROM buy_requests WHERE id = $1 RETURNING *`,
      [requestId]
    );
    
    console.log(`[DELETE] Successfully deleted request ${requestId}`);
    res.json({ 
      message: "Buy request successfully deleted",
      deletedRequest: deleteResult.rows[0]
    });
    
  } catch (err) {
    console.error("[DELETE] Error deleting buy request:", err);
    res.status(500).json({ message: "Failed to delete buy request", error: err.message });
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

// Route to clear a buy request
router.put('/clear/:id', verifyToken, async (req, res) => {
  const requestId = req.params.id;
  const buyerUsername = req.user.username;

  try {
    const result = await pool.query(
      `UPDATE buy_requests
       SET cleared_by_buyer = TRUE
       WHERE id = $1 AND buyer_username = $2
       RETURNING *;`,
      [requestId, buyerUsername]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Request not found or unauthorized" });
    }

    res.json({ message: 'Buy request cleared.' });
  } catch (err) {
    console.error("Clear error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to clear a buy request for seller
router.put('/clear-seller/:id', verifyToken, async (req, res) => {
  const requestId = req.params.id;
  const sellerUsername = req.user.username;

  try {
    // First verify this request is for an item owned by this seller
    const checkQuery = await pool.query(
      `SELECT br.id
       FROM buy_requests br
       JOIN items i ON br.item_id = i.id
       WHERE br.id = $1 AND LOWER(i.seller_username) = LOWER($2)`,
      [requestId, sellerUsername]
    );

    if (checkQuery.rowCount === 0) {
      return res.status(404).json({ message: "Request not found or unauthorized" });
    }

    // Update the request to be cleared by seller
    const result = await pool.query(
      `UPDATE buy_requests
       SET cleared_by_seller = TRUE
       WHERE id = $1
       RETURNING *;`,
      [requestId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: 'Buy request cleared.' });
  } catch (err) {
    console.error("[CLEAR-SELLER] Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
