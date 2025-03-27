import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// CheckoutPage component handles form input, displays cart items, and processes final order
export default function CheckoutPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Store cart items and total amount
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Store shipping and payment form inputs
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
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

  // Confirm checkout — sends request to backend and clears state
  const handleConfirmCheckout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/cart/checkout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Order placed successfully!");

      // Clear local state
      setCartItems([]);
      setTotal(0);

      // Clear session from storage
      localStorage.removeItem("token");
      localStorage.removeItem("username");

      // Redirect to login page and refresh app state
      navigate("/LoginPage");
      window.location.reload();
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to place order.");
    }
  };

  // Navigate user back to the home page
  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
      <h1>Checkout</h1>

      {/* Shipping and Payment Form */}
      <h3>Shipping & Payment</h3>
      <form style={{ display: "grid", gap: "1rem" }}>
        <input name="fullName" placeholder="Full Name" onChange={handleInputChange} />
        <input name="address" placeholder="Address" onChange={handleInputChange} />
        <input name="city" placeholder="City" onChange={handleInputChange} />
        <input name="state" placeholder="State" onChange={handleInputChange} />
        <input name="zip" placeholder="ZIP Code" onChange={handleInputChange} />
        <input name="cardNumber" placeholder="Card Number" onChange={handleInputChange} />
        <input name="expiry" placeholder="MM/YY" onChange={handleInputChange} />
        <input name="cvv" placeholder="CVV" onChange={handleInputChange} />
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
        <button onClick={handleConfirmCheckout}>Confirm Purchase</button>
        <button onClick={handleBackToHome}>Back to Home</button>
      </div>
    </div>
  );
}
