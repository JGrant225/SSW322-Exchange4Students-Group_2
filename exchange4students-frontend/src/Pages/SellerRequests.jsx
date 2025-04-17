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
      const data = Array.isArray(res.data) ? res.data : [];
      setRequests(data);
    } catch (err) {
      console.error("[SellerRequests] Error fetching requests:", err.response?.data || err.message || err);
      setRequests([]);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Accept a specific buy request
  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/buyrequests/${requestId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Request accepted. Item is now On Hold.");
      fetchRequests();
    } catch (err) {
      console.error("Error accepting request:", err.response?.data || err.message || err);
      alert("Failed to accept buy request.");
    }
  };

  // Deny a specific buy request
  const handleDenyRequest = async (requestId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/buyrequests/${requestId}/status`, {
        status: "Rejected"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Request denied.");
      fetchRequests();
    } catch (err) {
      console.error("Error denying request:", err.response?.data || err.message || err);
      alert("Failed to deny buy request.");
    }
  };

  // Don't show while viewing checkout
  if (location.pathname === "/checkout") return null;

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
            right: "1rem",
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
            requests.map((req, index) => (
              <div
                key={req.id || index}
                style={{
                  border: "1px solid #ddd",
                  padding: "0.75rem",
                  marginBottom: "0.75rem",
                  borderRadius: "5px",
                }}
              >
                <strong>{req.item_title || "Untitled"}</strong>
                <p>Buyer: {req.buyer_username || "Unknown"}</p>
                <p>Email: {req.contact_email || "N/A"}</p>
                <p>Phone: {req.contact_phone || "N/A"}</p>
                <p>Message: {req.message || "No message"}</p>
                <p>Status: <strong>{req.request_status || "Pending"}</strong></p>

                {req.request_status === "Pending" && (
                  <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleAcceptRequest(req.id)}>Accept</button>
                    <button onClick={() => handleDenyRequest(req.id)}>Deny</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
