import React, { useState } from "react";
import axios from "axios";

// BrowseItems component allows buyers to browse items by category and add them to the cart
export function BrowseItems({ onCartUpdate }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Token from localStorage
  const token = localStorage.getItem("token");

  // Fetch items for selected category
  const fetchItems = async (category) => {
    setLoading(true);
    setError(null);
    setItems([]);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/items`);
      const filtered = response.data.filter(item => item.category === category);
      setItems(filtered);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Error fetching items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart (sends itemId only)
  const handleAddToCart = async (itemId) => {
    if (!token) {
      alert("You must be logged in to add items to cart.");
      return;
    }
  
    try {
      const payload = { itemId };
      console.log("Sending to /cart/add:", payload);
  
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/cart/add`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Server response:", res.data);
      alert("Item added to cart!");
      if (onCartUpdate) onCartUpdate();
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err);
      alert("Failed to add item to cart.");
    }
  };
  

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Exchange4Students Marketplace</h1>
      <h2>Select a category to browse</h2>

      {/* Category buttons */}
      <div style={{ marginBottom: "1rem" }}>
        {["Sports", "Music", "Technology", "Clothes", "Misc"].map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              fetchItems(category);
            }}
            style={{
              marginRight: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: selectedCategory === category ? "#ccc" : "#eee"
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Display loading, errors, or items */}
      <div className="items">
        {loading && <p>Loading items...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && selectedCategory && items.length === 0 && (
          <p>No items found for <strong>{selectedCategory}</strong>.</p>
        )}

        {/* Item cards */}
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid gray",
              padding: "1rem",
              marginBottom: "1rem",
              maxWidth: "500px"
            }}
          >
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p><strong>Price:</strong> ${item.price}</p>
            <p><strong>Seller:</strong> {item.seller_username}</p>

            {item.image && (
              <img
                src={`${process.env.REACT_APP_API_URL}/uploads/${item.image}`}
                alt={item.title}
                style={{ width: "150px", height: "auto", marginTop: "0.5rem" }}
              />
            )}

            <button
              style={{ marginTop: "0.5rem" }}
              onClick={() => handleAddToCart(item.id)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrowseItems;
