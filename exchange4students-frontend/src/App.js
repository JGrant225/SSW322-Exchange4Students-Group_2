import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import { LoginPage } from './Pages/LoginPage';
import BrowseItems from './Pages/BrowseItems';
import Cart from './Pages/Cart';
import CheckoutPage from './Pages/CheckoutPage';
import React, { useState } from 'react';

function App() {
  const [token] = useState(localStorage.getItem("token") || "");
  const [username] = useState(localStorage.getItem("username") || "");

  // Track buyer/seller role
  const [userRole, setUserRole] = useState("");

  // Trigger to refresh cart
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

  const handleCartUpdate = () => {
    setCartUpdateTrigger((prev) => prev + 1);
  };

  return (
    <Router>
      {/* Only show Cart if role is 'buyer' */}
      {userRole === "buyer" && (
        <Cart
          username={username}
          token={token}
          refreshTrigger={cartUpdateTrigger}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/LoginPage"
          element={
            <LoginPage
              onCartUpdate={handleCartUpdate}
              onRoleChange={(role) => setUserRole(role)}
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
