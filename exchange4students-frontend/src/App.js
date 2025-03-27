import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import { LoginPage } from './Pages/LoginPage';
import BrowseItems from './Pages/BrowseItems';
import Cart from './Pages/Cart';
import React, { useState } from 'react';

function App() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // State to trigger cart refresh
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

  const handleCartUpdate = () => {
    setCartUpdateTrigger(prev => prev + 1);
  };

  return (
    <Router>
      {/* Floating Cart on all pages */}
      <Cart username={username} token={token} refreshTrigger={cartUpdateTrigger} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/LoginPage" element={<LoginPage onCartUpdate={handleCartUpdate} />} />
        <Route path="/BrowseItems" element={<BrowseItems onCartUpdate={handleCartUpdate} />} />
      </Routes>
    </Router>
  );
}

export default App;
