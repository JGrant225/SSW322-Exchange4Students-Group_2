import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import { LoginPage } from './Pages/LoginPage';
import BrowseItems from './Pages/BrowseItems';
import Cart from './Pages/Cart';
import CheckoutPage from './Pages/CheckoutPage';
import SellerRequests from './Pages/SellerRequests';
import React, { useState } from 'react';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  // Track buyer/seller role
  const [userRole, setUserRole] = useState("");

  // Trigger to refresh cart
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

  const handleCartUpdate = () => {
    setCartUpdateTrigger((prev) => prev + 1);
  };

  // Update role and persist username/token on login
  const handleRoleChange = (role) => {
    setUserRole(role);
    setToken(localStorage.getItem("token") || "");
    setUsername(localStorage.getItem("username") || "");
  };

  return (
    <Router>
      {/* Only show Cart if role is 'buyer' and logged in */}
      {userRole === "buyer" && token && (
        <Cart
          username={username}
          token={token}
          refreshTrigger={cartUpdateTrigger}
        />
      )}

      {/* Only show SellerRequests if role is 'seller' and logged in */}
      {userRole === "seller" && token && (
        <SellerRequests
          username={username}
          token={token}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/LoginPage"
          element={
            <LoginPage
              onCartUpdate={handleCartUpdate}
              onRoleChange={handleRoleChange}
            />
          }
        />
        <Route
          path="/BrowseItems"
          element={<BrowseItems onCartUpdate={handleCartUpdate} />}
        />
        <Route
          path="/checkout"
          element={
            <CheckoutPage
              token={token}
              username={username}
              onCartUpdate={handleCartUpdate}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
