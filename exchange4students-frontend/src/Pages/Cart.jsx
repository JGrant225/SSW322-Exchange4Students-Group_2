import React, { useEffect, useState } from "react";
import axios from "axios";

// Cart component - floating button with dropdown cart display
export default function Cart({ username, token }) {
  // State for items, total price, dropdown visibility, and user messages
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Fetch cart items from backend on username/token changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!username || !token) return;
  
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` }
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

  // Remove item from cart by ID
  const handleRemove = async (itemId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state after deletion
      const updatedCart = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updatedCart);

      const newTotal = updatedCart.reduce((sum, item) => sum + parseFloat(item.price), 0);
      setTotal(newTotal);
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // Handle checkout - clears cart on server and locally
  const handleCheckout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/cart/checkout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCartItems([]);
      setTotal(0);
      setMessage("Checkout successful!");
    } catch (err) {
      console.error("Checkout error:", err);
      setMessage("Checkout failed.");
    }
  };

  return (
    <div>
      {/* Floating cart button in top-right corner */}
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
          zIndex: 1000
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        🛒 Cart ({cartItems.length})
      </div>

      {/* Cart dropdown panel */}
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
            zIndex: 999
          }}
        >
          <h3>Your Cart</h3>
          {message && <p>{message}</p>}

          {/* Empty cart message */}
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {/* List all cart items */}
              {cartItems.map((item) => (
                <div key={item.id} style={{ marginBottom: "1rem" }}>
                  <strong>{item.title}</strong>
                  <p>Price: ${item.price}</p>
                  <button onClick={() => handleRemove(item.id)}>Remove</button>
                </div>
              ))}

              <hr />
              <p><strong>Total:</strong> ${total.toFixed(2)}</p>
              <button onClick={handleCheckout}>Checkout</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
