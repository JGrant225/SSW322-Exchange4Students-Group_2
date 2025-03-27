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
    navigate("/");
  };

  // Initialize from passed state or redirect
  useEffect(() => {
    const state = location.state;
    if (state && state.username && state.token) {
      setUsername(state.username);
      setToken(state.token);
      localStorage.setItem("username", state.username);
      localStorage.setItem("token", state.token);
    } else {
      navigate("/");
    }
  }, [location, navigate]);

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
        <button onClick={() => { setSelectedTab("seller"); onRoleChange("seller"); }}>Seller</button>
        <button onClick={() => { setSelectedTab("buyer"); onRoleChange("buyer"); }}>Buyer</button>
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
      {selectedTab === "buyer" && (
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
