import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function BuyerRequests({ username, token }) {
  const [requests, setRequests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState({ message: "", error: false });
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

  const handleDeleteRequest = async (requestId) => {
    // Reset status message
    setDeleteStatus({ message: "", error: false });
    
    try {
      // Confirm the deletion
      if (!window.confirm("Are you sure you want to cancel this request?")) {
        return;
      }
      
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/buyrequests/${requestId}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove the deleted request from state
      setRequests(requests.filter(req => req.id !== requestId));
      
      // Set success message
      setDeleteStatus({ 
        message: "Request successfully cancelled", 
        error: false 
      });
      
      // Clear the message after 3 seconds
      setTimeout(() => setDeleteStatus({ message: "", error: false }), 3000);
      
    } catch (err) {
      console.error("[BuyerRequests] Delete Error:", err.response?.data || err.message);
      
      // Set error message
      setDeleteStatus({ 
        message: err.response?.data?.message || "Error cancelling request", 
        error: true 
      });
      
      // Clear the error message after 5 seconds
      setTimeout(() => setDeleteStatus({ message: "", error: false }), 5000);
    }
  };

  const handleClearRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to clear this notification?")) return;
  
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/buyrequests/clear/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Remove from view
      setRequests(requests.filter((req) => req.id !== requestId));
  
      setDeleteStatus({ message: "Notification cleared.", error: false });
      setTimeout(() => setDeleteStatus({ message: "", error: false }), 3000);
    } catch (err) {
      console.error("[BuyerRequests] Clear Error:", err.response?.data || err.message);
  
      setDeleteStatus({
        message: err.response?.data?.message || "Error clearing notification",
        error: true,
      });
      setTimeout(() => setDeleteStatus({ message: "", error: false }), 5000);
    }
  };  

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

          {deleteStatus.message && (
            <div 
              style={{
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
                backgroundColor: deleteStatus.error ? "#ffdddd" : "#ddffd6",
                color: deleteStatus.error ? "#c00" : "#060"
              }}
            >
              {deleteStatus.message}
            </div>
          )}

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

                {req.request_status === "Pending" && (
                  <button 
                    onClick={() => handleDeleteRequest(req.id)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      padding: "5px 10px",
                      cursor: "pointer",
                      marginTop: "5px"
                    }}
                  >
                    Cancel Request
                  </button>
                )}
                {(req.request_status === "Accepted" || req.request_status === "Rejected") && (
                  <button
                    onClick={() => handleClearRequest(req.id)}
                    style={{
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      padding: "5px 10px",
                      cursor: "pointer",
                      marginTop: "5px",
                      marginLeft: "10px"
                    }}
                  >
                    Clear Notification
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
