import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CheckoutPage.css";
// CheckoutPage component handles form input, displays cart items, and processes final order
export default function CheckoutPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // Store cart items and total amount
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Store contact and message form inputs
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: ""
  });

  // Fetch user's cart items on page load
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCartItems(res.data);

        // Calculate total from items
        const totalAmount = res.data.reduce((sum, item) => sum + parseFloat(item.price), 0);
        setTotal(totalAmount);
      } catch (err) {
        console.error("Failed to load cart:", err);
      }
    };

    fetchCart();
  }, [token]);

  // Handle changes to form input fields
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Confirm checkout — validates input and processes buy requests
  const handleConfirmCheckout = async () => {
    if (!form.fullName || !form.email || !form.phone) {
      alert("Please fill out your full name, email, and phone number.");
      return;
    }

    const phoneRegex = /^[0-9\-\+\s\(\)]+$/;
    if (!phoneRegex.test(form.phone)) {
      alert("Please enter a valid phone number.");
      return;
    }

    try {
      for (const item of cartItems) {
        await axios.post(`${process.env.REACT_APP_API_URL}/buyrequests`, {
          item_id: item.id,
          contact_email: form.email,
          contact_phone: form.phone,
          message: form.message || "",
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      await axios.delete(`${process.env.REACT_APP_API_URL}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Buy requests sent successfully!");

      // Clear local state
      setCartItems([]);
      setTotal(0);

      // Redirect to login page to refresh state
      navigate("/LoginPage", {
        state: { username, token }
      });
      window.location.reload();
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to place buy request.");
    }
  };

  // Navigate user back to the dashboard (LoginPage)
  const handleBackToHome = () => {
    navigate("/LoginPage", {
      state: { username, token }
    });
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
      <h1>Checkout</h1>
      <div class="ContactCheckout">
      {/* Contact Information Form */}
      <h3>Your Contact Info</h3>
      <form style={{ display: "grid", gap: "1rem" }}>
        <input name="fullName" placeholder="Full Name" onChange={handleInputChange} />
        <input name="email" placeholder="Email Address" onChange={handleInputChange} />
        <input name="phone" type="tel" placeholder="Phone Number" onChange={handleInputChange} />
        <textarea name="message" placeholder="Optional message to seller" onChange={handleInputChange} />
      </form>
  
      {/* Order Summary */}
      <h3>Cart Summary</h3>
      <ul>
        {cartItems.map(item => (
          <li key={item.id}>{item.title} - ${item.price}</li>
        ))}
      </ul>

      <p><strong>Total:</strong> ${total.toFixed(2)}</p>

      {/* Action buttons for checkout and navigation */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button class="ConfirmPurchase" onClick={handleConfirmCheckout}>Confirm Purchase</button>
        <button class="BackToHome" onClick={handleBackToHome}>Back to Home</button>
      </div>
      </div>
    </div>
  );
}
