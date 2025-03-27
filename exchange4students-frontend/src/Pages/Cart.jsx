import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

// Cart component - floating button with dropdown cart display
export default function Cart({ username, token, refreshTrigger }) {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch cart items (always run this hook!)
  useEffect(() => {
    const fetchCart = async () => {
      if (!username || !token) return;

      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCartItems(res.data);
        const totalAmount = res.data.reduce((sum, item) => sum + parseFloat(item.price), 0);
        setTotal(totalAmount);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setMessage("Failed to load cart items.");
      }
    };

    fetchCart();
  }, [username, token, refreshTrigger]);

  // Remove item from cart
  const handleRemove = async (itemId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedCart = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updatedCart);

      const newTotal = updatedCart.reduce((sum, item) => sum + parseFloat(item.price), 0);
      setTotal(newTotal);
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // Redirect to checkout
  const handleCheckoutRedirect = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  // ✅ Only return null AFTER hooks are called
  if (location.pathname === "/checkout") {
    return null;
  }

  return (
    <div>
      {/* Floating cart button */}
      <div
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          backgroundColor: "#007bff",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: "20px",
          cursor: "pointer",
          zIndex: 1000,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        🛒 Cart ({cartItems.length})
      </div>

      {/* Cart dropdown */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: "3.5rem",
            right: "1rem",
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "8px",
            width: "300px",
            maxHeight: "400px",
            overflowY: "auto",
            zIndex: 999,
          }}
        >
          <h3>Your Cart</h3>
          {message && <p>{message}</p>}

          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.id} style={{ marginBottom: "1rem" }}>
                  <strong>{item.title}</strong>
                  <p>Price: ${item.price}</p>
                  <button onClick={() => handleRemove(item.id)}>Remove</button>
                </div>
              ))}
              <hr />
              <p><strong>Total:</strong> ${total.toFixed(2)}</p>
              <button onClick={handleCheckoutRedirect}>Checkout</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
