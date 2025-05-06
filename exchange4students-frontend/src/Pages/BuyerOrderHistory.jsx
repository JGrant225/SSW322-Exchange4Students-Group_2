import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function BuyerOrderHistory({ username, token }) {
  const [orders, setOrders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        // Use the existing endpoint to fetch buyer requests
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/buyrequests/buyer`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter for accepted requests only
        const acceptedRequests = Array.isArray(res.data) 
          ? res.data.filter(req => req.request_status === 'Accepted')
          : [];
        
        setOrders(acceptedRequests);
      } catch (err) {
        console.error("[OrderHistory] Error:", err.response?.data || err.message || err);
      }
    };

    if (token) {
      fetchOrderHistory();
      // Refresh the order history periodically
      const interval = setInterval(fetchOrderHistory, 15000); // check every 15s
      return () => clearInterval(interval);
    }
  }, [token]);

  // Don't show the order history popup on checkout page
  if (location.pathname === "/checkout") return null;

  return (
    <div>
      <div
        style={{
          position: "fixed",
          bottom: "1rem",
          left: "1rem",
          backgroundColor: "#007bff",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: "20px",
          cursor: "pointer",
          zIndex: 1000,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        My Orders ({orders.length})
      </div>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "4rem",
            left: "1rem",
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "8px",
            width: "340px",
            maxHeight: "500px",
            overflowY: "auto",
            zIndex: 999,
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
          }}
        >
          <h3>My Orders</h3>
          
          {orders.length === 0 ? (
            <p>You don't have any active orders.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "0.75rem",
                  marginBottom: "0.75rem",
                  borderRadius: "5px",
                  backgroundColor: "#f9f9f9"
                }}
              >
                <strong>{order.item_title}</strong>
                <p>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      backgroundColor: order.itemstatus === "On Hold" ? "#fff3cd" : "#d1e7dd",
                      color: order.itemstatus === "On Hold" ? "#856404" : "#0f5132",
                      marginLeft: "5px"
                    }}
                  >
                    {order.itemstatus === "On Hold" ? "Processing" : order.itemstatus}
                  </span>
                </p>
                <p>Ordered: {new Date(order.requested_at).toLocaleDateString()}</p>
                
                {order.image && (
                  <div style={{ marginTop: "10px", textAlign: "center" }}>
                    <img 
                      src={order.image} 
                      alt={order.item_title}
                      style={{ 
                        maxWidth: "100%", 
                        maxHeight: "150px", 
                        objectFit: "cover",
                        borderRadius: "4px" 
                      }}
                    />
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