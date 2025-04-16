import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

// SellerRequests component - floating button with dropdown display
export default function SellerRequests({ username, token }) {
  const [requests, setRequests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Fetch buy requests for the seller
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/buyrequests/seller`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ensure response is an array or fallback to []
      const data = Array.isArray(res.data) ? res.data : [];
      console.log("[SellerRequests] Fetched requests:", data);
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setRequests([]);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  // Update item status (Available, On Hold, Sold)
  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/items/${itemId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Item status updated to "${newStatus}"`);
      fetchRequests();
    } catch (err) {
      console.error("Error updating item status:", err);
      alert("Failed to update item status.");
    }
  };

  // Don't show while viewing checkout
  if (location.pathname === "/checkout") {
    return null;
  }

  return (
    <div>
      {/* Floating Seller Requests Button */}
      <div
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          backgroundColor: "#6c63ff",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: "20px",
          cursor: "pointer",
          zIndex: 1000,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        Requests ({requests.length})
      </div>

      {/* Dropdown Request Panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: "3.5rem",
            right: "6rem",
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "8px",
            width: "340px",
            maxHeight: "500px",
            overflowY: "auto",
            zIndex: 999,
          }}
        >
          <h3>Buy Requests</h3>
          {requests.length === 0 ? (
            <p>No requests yet.</p>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "0.75rem",
                  marginBottom: "0.75rem",
                  borderRadius: "5px",
                }}
              >
                <strong>{req.title}</strong>
                <p>Buyer: {req.buyer_username}</p>
                <p>Email: {req.contact_email}</p>
                <p>Phone: {req.contact_phone}</p>
                <p>Message: {req.message || "No message"}</p>
                <p>Status: <strong>{req.itemstatus}</strong></p>

                <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleStatusChange(req.item_id, "On Hold")}>On Hold</button>
                  <button onClick={() => handleStatusChange(req.item_id, "Sold")}>Sold</button>
                  <button onClick={() => handleStatusChange(req.item_id, "Available")}>Available</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
