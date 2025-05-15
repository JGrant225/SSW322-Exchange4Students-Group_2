import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostItem from "../Components/PostItem";
import SellerItems from "./SellerItems";
import BrowseItems from "./BrowseItems";
import axios from "axios";

function OrdersAndRequestsView({ username, token}) {
  const [buyerRequests, setBuyerRequests] = useState([]);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerRequests, setSellerRequests] = useState([]);
  const [clearedBuyerIds, setClearedBuyerIds] = useState(() => {
    const stored = localStorage.getItem("clearedRequestIds");
    return stored ? JSON.parse(stored) : [];
  });
  const [messages, setMessages] = useState({});

  const fetchBuyerData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/buyrequests/buyer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setBuyerRequests(data);
      setBuyerOrders(data.filter(r => r.request_status === "Accepted"));
    } catch (err) {
      console.error("[Buyer] Error:", err.message || err);
    }
  };

  const fetchSellerData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/buyrequests/seller`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSellerRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("[Seller] Error:", err.message || err);
    }
  };

  useEffect(() => {
    if (!username || !token) return;

    fetchBuyerData();
    fetchSellerData();

    const buyerInterval = setInterval(fetchBuyerData, 10000);
    const sellerInterval = setInterval(fetchSellerData, 10000);

    return () => {
      clearInterval(buyerInterval);
      clearInterval(sellerInterval);
    };
  }, [username, token]);

  const updateMessage = (text, error = false) => {
    setMessages({ text, error });
    setTimeout(() => setMessages({}), 3000);
  };

  const handleDeleteBuyerRequest = async (id) => {
    if (!window.confirm("Cancel this request?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/buyrequests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateMessage("Request cancelled.");
      setBuyerRequests(reqs => reqs.filter(r => r.id !== id));
    } catch (err) {
      updateMessage("Error cancelling request", true);
    }
  };

  const handleClearBuyerRequest = (id) => {
    if (!window.confirm("Clear this notification?")) return;
    const updated = [...clearedBuyerIds, id];
    setClearedBuyerIds(updated);
    localStorage.setItem("clearedRequestIds", JSON.stringify(updated));
    updateMessage("Notification cleared.");
  };

  const handleAcceptSellerRequest = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/buyrequests/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateMessage("Request accepted.");
      fetchSellerData();
    } catch (err) {
      updateMessage("Failed to accept request", true);
    }
  };

  const handleRejectSellerRequest = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/buyrequests/${id}/status`, {
        status: "Rejected"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateMessage("Request rejected.");
      fetchSellerData();
    } catch (err) {
      updateMessage("Failed to reject request", true);
    }
  };

  const handleClearSellerRequest = async (id) => {
    if (!window.confirm("Clear this seller notification?")) return;
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/buyrequests/clear-seller/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateMessage("Notification cleared.");
      setSellerRequests(reqs => reqs.filter(r => r.id !== id));
    } catch (err) {
      updateMessage("Failed to clear notification", true);
    }
  };

  const cardStyle = {
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "1rem",
    marginBottom: "1rem",
    backgroundColor: "#f8f9fa"
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Orders & Requests</h2>

      {messages.text && (
        <div style={{
          padding: "10px",
          backgroundColor: messages.error ? "#ffdddd" : "#ddffdd",
          color: messages.error ? "#900" : "#060",
          marginBottom: "1rem",
          borderRadius: "5px"
        }}>
          {messages.text}
        </div>
      )}

      {/* BUYER VIEW (Always shown if username/token exist) */}
      <>
        <section>
          <h3>My Orders</h3>
          {buyerOrders.length === 0 ? <p>No accepted orders.</p> : buyerOrders.map(order => (
            <div key={order.id} style={cardStyle}>
              <strong>{order.item_title}</strong>
              <p>Status: {order.itemstatus}</p>
              <p>Requested: {new Date(order.requested_at).toLocaleString()}</p>
              <button
                onClick={() => handleDeleteBuyerRequest(order.id)}
                style={{
                  marginTop: "0.25rem",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                Cancel Order
              </button>
            </div>
          ))}
        </section>

        <section>
          <h3>My Requests</h3>
          {buyerRequests.filter(r => !clearedBuyerIds.includes(r.id)).length === 0 ? (
            <p>No requests made.</p>
          ) : (
            buyerRequests
              .filter(r => !clearedBuyerIds.includes(r.id))
              .map(req => (
                <div key={req.id} style={cardStyle}>
                  <strong>{req.item_title}</strong>
                  <p>Status: {req.request_status}</p>
                  <p>Item Status: {req.itemstatus}</p>
                  <p>Requested: {new Date(req.requested_at).toLocaleString()}</p>
                  {req.request_status === "Pending" ? (
                    <button
                      onClick={() => handleDeleteBuyerRequest(req.id)}
                      style={{
                        marginTop: "0.25rem",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.4rem 0.8rem",
                        fontSize: "0.85rem",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => handleClearBuyerRequest(req.id)}
                      style={{
                        marginTop: "0.25rem",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.4rem 0.8rem",
                        fontSize: "0.85rem",
                        cursor: "pointer"
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              ))
          )}
        </section>
      </>

      {/* SELLER VIEW (Always shown) */}
      <section>
        <h3>Buy Requests</h3>
        {sellerRequests.length === 0 ? <p>No requests received.</p> : sellerRequests.map(req => (
          <div key={req.id} style={cardStyle}>
            <strong>{req.item_title}</strong>
            <p>Buyer: {req.buyer_username}</p>
            <p>Message: {req.message || "None"}</p>
            <p>Status: {req.request_status}</p>
            <div style={{ marginTop: "0.5rem" }}>
              {req.request_status === "Pending" ? (
                <>
                  <button
                    onClick={() => handleAcceptSellerRequest(req.id)}
                    style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      marginRight: "0.5rem"
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectSellerRequest(req.id)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.85rem",
                      cursor: "pointer"
                    }}
                  >
                    Deny
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleClearSellerRequest(req.id)}
                  style={{
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );

}


// LoginPage handles role selection and renders seller/buyer specific content
export function LoginPage({ onCartUpdate, onRoleChange, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [selectedTab, setSelectedTab] = useState("seller");
  const [refreshItems, setRefreshItems] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // On logout, clear state and storage
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setUsername("");
    setToken("");
    onLogout();
    onRoleChange("");
    navigate("/");
    console.log("App State after logout:", {
      userRole: "", username: "", token: ""
    });
  };

  const handleSidebarSelect = (role) => {
    setSelectedTab(role);
    onRoleChange(role);
    localStorage.setItem("role", role);
  };

  const sidebarButtonStyle = {
    display: "block",
    width: "100%",
    padding: "0.5rem",
    marginBottom: "0.5rem",
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "left"
  };


  // Initialize user and role from login or persistent session
  useEffect(() => {
    const state = location.state;
    const savedUsername = localStorage.getItem("username");
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (state && state.username && state.token) {
      setUsername(state.username);
      setToken(state.token);
      localStorage.setItem("username", state.username);
      localStorage.setItem("token", state.token);

      const loginRole = state.role || savedRole || "seller";
      setSelectedTab(loginRole);
      localStorage.setItem("role", loginRole);
      onRoleChange(loginRole);
    } else if (savedUsername && savedToken) {
      setUsername(savedUsername);
      setToken(savedToken);
      setSelectedTab(savedRole || "seller");
      onRoleChange(savedRole || "seller");
    } else {
      navigate("/");
    }
  }, [location, navigate, onRoleChange]);

  const handleItemPosted = () => {
    setRefreshItems((prev) => !prev);
  };

  return (
  <>
    {/* Sidebar toggle (hamburger) */}
    <div style={{
      position: "fixed",
      top: "1rem",
      left: "1rem",
      zIndex: 1000
    }}>
      <button onClick={() => setShowSidebar(!showSidebar)} style={{
        background: "#4caf50",
        border: "none",
        borderRadius: "4px",
        padding: "0.5rem",
        color: "#fff",
        fontSize: "1.25rem",
        cursor: "pointer"
      }}>
        {showSidebar ? "✕" : "☰"}
      </button>
    </div>

    {/* Sidebar */}
    <aside style={{
      width: "200px",
      backgroundColor: "#f4f4f4",
      padding: "1rem",
      paddingTop: "4rem",
      boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
      position: "fixed",
      top: "0",
      left: showSidebar ? "0" : "-220px",
      height: "100vh",
      zIndex: 999,
      transition: "left 0.3s ease-in-out"
    }}>
      <h3 style={{ marginBottom: "1rem" }}>Menu</h3>
      <button onClick={() => handleSidebarSelect("seller")} style={sidebarButtonStyle}>Post Item</button>
      <button onClick={() => handleSidebarSelect("buyer")} style={sidebarButtonStyle}>Browse</button>
      <button onClick={() => handleSidebarSelect("orders")} style={sidebarButtonStyle}>Orders & Requests</button>
      <button onClick={handleLogout} style={sidebarButtonStyle}>Logout</button>
    </aside>

    {/* Main content area */}
    <main style={{
      flex: 1,
      padding: "2rem",
      marginLeft: showSidebar ? "200px" : "0",
      transition: "margin-left 0.3s ease-in-out"
    }}>
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <img src="/logo.png" alt="Exchange4Students Logo" style={{ height: "100px" }} />
      </div>
      <h1 style={{ textAlign: "center" }}>Welcome to Exchange4Students!</h1>
      <p style={{ textAlign: "center" }}>Logged in as: <strong>{username}</strong></p>

      {selectedTab === "seller" && (
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <PostItem username={username} token={token} onItemPosted={handleItemPosted} />
          </div>
          <div style={{ flex: 2 }}>
            <SellerItems username={username} token={token} refreshTrigger={refreshItems} />
          </div>
        </div>
      )}

      {selectedTab === "buyer" && username && token && (
        <BrowseItems
          onCartUpdate={onCartUpdate}
          username={username}
          token={token}
        />
      )}

      {selectedTab === "orders" && (
        <OrdersAndRequestsView
          username={username}
          token={token}
        />
      )}

    </main>
  </>
);
}

export default LoginPage;
