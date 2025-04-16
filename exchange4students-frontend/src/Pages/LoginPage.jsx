import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostItem from "../Components/PostItem";
import SellerItems from "./SellerItems";
import BrowseItems from "./BrowseItems";

// LoginPage handles role selection and renders seller/buyer specific content
export function LoginPage({ onCartUpdate, onRoleChange }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [selectedTab, setSelectedTab] = useState("seller");
  const [refreshItems, setRefreshItems] = useState(false);

  // On logout, clear state and storage
  const handleLogout = () => {
    setUsername("");
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    onRoleChange("");
    navigate("/");
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
      <h1>Exchange4Students</h1>

      {username && (
        <>
          <p>Logged in as: <strong>{username}</strong></p>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}

      <h2>Choose a role:</h2>
      <div>
        <button onClick={() => {
          setSelectedTab("seller");
          onRoleChange("seller");
          localStorage.setItem("role", "seller");
        }}>
          Seller
        </button>
        <button onClick={() => {
          setSelectedTab("buyer");
          onRoleChange("buyer");
          localStorage.setItem("role", "buyer");
        }}>
          Buyer
        </button>
      </div>

      <hr />

      {/* Seller view */}
      {selectedTab === "seller" && (
        <>
          <PostItem username={username} token={token} onItemPosted={handleItemPosted} />
          <SellerItems username={username} token={token} refreshTrigger={refreshItems} />
        </>
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
