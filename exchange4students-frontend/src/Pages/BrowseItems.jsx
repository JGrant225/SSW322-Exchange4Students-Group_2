import React, { useState } from "react";
import axios from "axios";

// Buyer side to view items by category
export function BrowseItems() {
  // Selected category state
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Array of items fetched from the server
  const [items, setItems] = useState([]);

  // Loading and error states for request handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch items by category from backend
  const fetchItems = async (category) => {
    setLoading(true);
    setError(null);
    setItems([]);

    try {
      // Fetch items for the selected category from backend
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/items`);

      // Filter by category on frontend (unless backend does it)
      const filtered = response.data.filter(item => item.category === category);

      // Update state with filtered results
      setItems(filtered);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Error fetching items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Exchange4Students Marketplace</h1>
      <h2>Select a category to browse</h2>

      {/* Category filter buttons */}
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

      {/* Display loading, error, or fetched items */}
      <div className="items">
        {loading && <p>Loading items...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* If no items found */}
        {!loading && !error && selectedCategory && items.length === 0 && (
          <p>No items found for <strong>{selectedCategory}</strong>.</p>
        )}

        {/* If items found */}
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

            {/* Show item image if available */}
            {item.image && (
              <img
                src={`${process.env.REACT_APP_API_URL}/uploads/${item.image}`}
                alt={item.title}
                style={{ width: "150px", height: "auto", marginTop: "0.5rem" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrowseItems;