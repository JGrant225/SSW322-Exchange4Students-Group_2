import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostItem from "../Components/PostItem";
import SellerItems from "../Pages/SellerItems";
import { Test }from "../Pages/Test";

// LoginPage handles role selection and renders seller/buyer specific content
export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [selectedTab, setSelectedTab] = useState("seller");

  // Refresh flag to trigger item re-fetch after posting
  const [refreshItems, setRefreshItems] = useState(false);

  // Clears state and returns to home
  const handleLogout = () => {
    setUsername("");
    setToken("");
    navigate("/");
  };

  // Initialize from passed state
  useEffect(() => {
    const state = location.state;
    if (state && state.username && state.token) {
      setUsername(state.username);
      setToken(state.token);
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  // Handler for new item posted
  const handleItemPosted = () => {
    setRefreshItems((prev) => !prev); // toggles value to trigger re-fetch
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
        <button onClick={() => setSelectedTab("seller")}>Seller</button>
        <button onClick={() => setSelectedTab("buyer")}>Buyer</button>
      </div>

      <hr />

      {/* Seller View: Post item and view/edit/delete list */}
      {selectedTab === "seller" && (
        <>
          <PostItem username={username} token={token} onItemPosted={handleItemPosted} />
          <SellerItems username={username} token={token} refreshTrigger={refreshItems} />
        </>
      )}

      {/* Buyer View (Placeholder) */}
      {selectedTab === "buyer" && (
        <div>
          <h3>Buyer Page (Placeholder)</h3>
          <Test />
        </div>
      )}

      </div>
    
  );
}

export default LoginPage;
