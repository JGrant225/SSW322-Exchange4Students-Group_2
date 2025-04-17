import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function BuyerRequests({ username, token }) {
  const [requests, setRequests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchBuyerRequests = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/buyrequests/buyer`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("[BuyerRequests] Error:", err.response?.data || err.message || err);
      }
    };

    fetchBuyerRequests();
    const interval = setInterval(fetchBuyerRequests, 10000); // check every 10s
    return () => clearInterval(interval);
  }, [token]);

  if (location.pathname === "/checkout") return null;

  return (
    <div>
      <div
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          backgroundColor: "#28a745",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: "20px",
          cursor: "pointer",
          zIndex: 1000,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        My Requests ({requests.length})
      </div>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "4rem",
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
          <h3>My Requests</h3>
          {requests.length === 0 ? (
            <p>You haven't made any requests.</p>
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
                <strong>{req.item_title}</strong>
                <p>Status: <strong>{req.request_status}</strong></p>
                <p>Item Status: {req.itemstatus}</p>
                <p>Requested At: {new Date(req.requested_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
