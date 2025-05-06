import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    if (!form.fullName && !form.email && !form.phone) {
      alert("Please enter your full name, email, and phone number.");
      return;
    } 
    if (!form.fullName && !form.email) {
      alert("Please enter your full name and a valid email.");
      return;
    }
    if (!form.fullName && !form.phone) {
      alert("Please enter your full name and a valid phone number.");
      return;
    }
    if (!form.email && !form.phone) {
      alert("Please enter a valid email and phone number.");
      return;
    }
    if (!form.fullName) {
      alert("Please enter your full name.");
      return;
    }
    if (!form.email) {
      alert("Please enter a valid email.");
      return;
    }
    if (!form.phone) {
      alert("Please enter a valid phone number.");
      return;
    }
    
    const phoneRegex = /^[0-9\-\+\s\(\)]+$/;
    if (!phoneRegex.test(form.phone)) {
      alert("Please enter a valid phone number.");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(form.email)) {
      alert("Please enter a valid email.");
      return;
    }

    const fullNameRegex = /^[a-zA-Z]+ [a-zA-Z]+$/;
    if (!fullNameRegex.test(form.fullName)) {
      alert("Please enter your full name.");
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
    <div style={{
      padding: "2rem",
      maxWidth: "700px",
      margin: "auto",
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      color: "#2c3e50"
    }}>    
      <h1>Checkout</h1>

      {/* Contact Information Form */}
      <h3>Your Contact Info</h3>
      <form style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
        <input 
          name="fullName" 
          placeholder="Full Name" 
          onChange={handleInputChange} 
          style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" }}
        />
        <input 
          name="email" 
          placeholder="Email Address" 
          onChange={handleInputChange} 
          style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" }}
        />
        <input n
          name="phone" 
          type="tel" 
          placeholder="Phone Number" 
          onChange={handleInputChange} 
          style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" }}
        />
        <textarea 
          name="message" 
          placeholder="Optional message to seller" 
          onChange={handleInputChange} 
          style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" }}
        />
      </form>

      {/* Order Summary */}
      <h3>Cart Summary</h3>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {cartItems.map(item => (
          <li key={item.id} style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "0.75rem",
            marginBottom: "0.75rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fafafa"
          }}>
            {item.image && (
              <img
                src={`${process.env.REACT_APP_API_URL}/uploads/${item.image}`}
                alt={item.title}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "contain",
                  borderRadius: "6px",
                  border: "1px solid #ccc"
                }}
              />
            )}
            <div>
              <div style={{ fontWeight: "600" }}>{item.title}</div>
              <div style={{ fontSize: "0.9rem", color: "#555" }}>${item.price}</div>
            </div>
          </li>
        ))}
      </ul>



      <p style={{ fontSize: "1.2rem", fontWeight: "600" }}>
        Total: ${total.toFixed(2)}
      </p>


      {/* Action buttons for checkout and navigation */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
        <button
          onClick={handleConfirmCheckout}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "0.75rem 1.25rem",
            borderRadius: "6px",
            border: "none",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Confirm Purchase
        </button>

        <button
          onClick={handleBackToHome}
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            padding: "0.75rem 1.25rem",
            borderRadius: "6px",
            border: "none",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Back to Home
        </button>
      </div>

    </div>
  );
}
