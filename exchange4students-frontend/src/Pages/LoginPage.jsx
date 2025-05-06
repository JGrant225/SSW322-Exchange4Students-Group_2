import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostItem from "../Components/PostItem";
import SellerItems from "./SellerItems";
import BrowseItems from "./BrowseItems";

// LoginPage handles role selection and renders seller/buyer specific content
export function LoginPage({ onCartUpdate, onRoleChange, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [selectedTab, setSelectedTab] = useState("seller");
  const [refreshItems, setRefreshItems] = useState(false);

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
    <div style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>
        Welcome to Exchange4Students!
      </h1>

      {username && (
        <>
          <p>Logged in as: <strong>{username}</strong></p>
          <button onClick={handleLogout} style={{
            cursor: "pointer",
            marginRight: "1rem",
            transition: "all 0.2s ease",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#4caf50",
            color: "#fff",
          }}>Logout</button>
        </>
      )}

      <h2 style={{ textAlign: "center" }}>Choose a role:</h2>
      <div style={{ textAlign: "center" }}>
        <button onClick={() => {
          setSelectedTab("seller");
          onRoleChange("seller");
          localStorage.setItem("role", "seller");
        }} style={{
          cursor: "pointer",
          marginRight: "1rem",
          transition: "all 0.2s ease",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#4caf50",
          color: "#fff",
        }}>Seller</button>
        <button onClick={() => {
          setSelectedTab("buyer");
          onRoleChange("buyer");
          localStorage.setItem("role", "buyer");
        }} style={{
          cursor: "pointer",
          marginRight: "1rem",
          transition: "all 0.2s ease",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#4caf50",
          color: "#fff",
        }}>Buyer</button>
      </div>

      <hr />

      {/* Seller view */}
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


      {/* Buyer view */}
      {selectedTab === "buyer" && username && token && (
        <BrowseItems
          onCartUpdate={onCartUpdate}
          username={username}
          token={token}
        />
      )}
    </div>
  );
}

export default LoginPage;
