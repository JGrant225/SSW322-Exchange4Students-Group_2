import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './Pages/Home';
import { LoginPage } from './Pages/LoginPage';
import BrowseItems from './Pages/BrowseItems';
import Cart from './Pages/Cart';
import CheckoutPage from './Pages/CheckoutPage';
import SellerRequests from './Pages/SellerRequests';
import BuyerRequests from './Pages/BuyerRequests';
import BuyerOrderHistory from './Pages/BuyerOrderHistory';
import React, { useState } from 'react';

function AppWrapper() {
  const location = useLocation();
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

  const handleCartUpdate = () => {
    setCartUpdateTrigger(prev => prev + 1);
  };

  const handleRoleChange = (role) => {
    setUserRole(role);
    setToken(localStorage.getItem("token") || "");
    setUsername(localStorage.getItem("username") || "");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    setUserRole("");
    setToken("");
    setUsername("");
  };

  const isHomePage = location.pathname === "/";
  const isCheckoutPage = location.pathname === "/checkout";

  return (
    <>
      {/* Buyer features */}
      {userRole === "buyer" && token && !isHomePage && (
        <>
          <Cart username={username} token={token} refreshTrigger={cartUpdateTrigger} />
          <BuyerRequests username={username} token={token} />
          {!isCheckoutPage && <BuyerOrderHistory username={username} token={token} />}
        </>
      )}

      {/* Seller features */}
      {userRole === "seller" && token && !isHomePage && (
        <SellerRequests username={username} token={token} />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/LoginPage"
          element={
            <LoginPage
              onCartUpdate={handleCartUpdate}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
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
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
