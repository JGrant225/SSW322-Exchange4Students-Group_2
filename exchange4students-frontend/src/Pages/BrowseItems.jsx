import React, { useState, useEffect } from "react";
import axios from "axios";

// BrowseItems component allows buyers to browse items by category and add them to the cart
export function BrowseItems({ onCartUpdate, username, token }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Initial load of items
  useEffect(() => {
    fetchItems(null, '');
  }, []);

  // Fetch items for selected category
  const fetchItems = async (category = selectedCategory, search = searchTerm) => {
    setLoading(true);
    setError(null);
    setDebugInfo('');

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (search && search.trim()) params.append("search", search.trim());
      
      const apiUrl = `${process.env.REACT_APP_API_URL}/items`;
      const fullUrl = `${apiUrl}${params.toString() ? `?${params.toString()}` : ''}`;
      
      console.log(`[BrowseItems] Making API request to: ${fullUrl}`);
      setDebugInfo(prev => prev + `Making request to: ${fullUrl}\n`);
      
      const response = await axios.get(fullUrl);
      
      console.log(`[BrowseItems] API response status: ${response.status}`);
      console.log(`[BrowseItems] Items returned: ${response.data.length}`);
      setDebugInfo(prev => prev + `Response status: ${response.status}\nItems returned: ${response.data.length}\n`);
      
      setItems(response.data);
    } catch (err) {
      const errorMessage = err.response ? 
        `Error ${err.response.status}: ${err.response.data.message || err.message}` :
        `Error: ${err.message}`;
      
      console.error("[BrowseItems] Error fetching items:", errorMessage);
      setError(errorMessage);
      setDebugInfo(prev => prev + `Error: ${errorMessage}\n`);
    } finally {
      setLoading(false);
    }
  };

  // Keyword search function
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    // Use setTimeout to debounce the search
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    window.searchTimeout = setTimeout(() => {
      fetchItems(selectedCategory, value);
    }, 500);
  };

  //Display items matching to keyword
  const handleCategoryClick = (category) => {
    const newCategory = category === selectedCategory ? null : category;
    setSelectedCategory(newCategory);
    fetchItems(newCategory, searchTerm);
  };

  // Add item to cart (sends itemId only)
  const handleAddToCart = async (itemId) => {
    if (!token || !username) {
      alert("You must be logged in to add items to cart.");
      return;
    }

    try {
      const payload = { itemId };
      console.log("[AddToCart] POST /cart/add payload:", payload);

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

      console.log("Cart add response:", res.data);
      alert("Item added to cart!");

      if (onCartUpdate) onCartUpdate();
    } catch (err) {
      console.error("Error adding to cart:", err.response?.data || err);
      alert("Failed to add item to cart.");
    }
  };

// Render a tag for each search term with ability to remove it
  const renderSearchTags = () => {
    if (!searchTerm.trim()) return null;

  const searchTerms = searchTerm
    .split(',')
    .map(term => term.trim())
    .filter(term => term);
      
  if (searchTerms.length === 0) return null;
    
    return (
      <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {searchTerms.map((term, index) => (
          <span key={index} style={{ 
            backgroundColor: "#e1e1e1", 
            padding: "0.25rem 0.5rem", 
            borderRadius: "16px", 
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center"
          }}>
            {term}
            <button 
              onClick={() => {
                // Remove this term
                const newTerms = searchTerms.filter((_, i) => i !== index);
                const newSearchTerm = newTerms.join(', ');
                setSearchTerm(newSearchTerm);
                fetchItems(selectedCategory, newSearchTerm);
              }}
              style={{
                marginLeft: "0.25rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.8rem",
                color: "#666"
              }}
            >
              ×
            </button>
          </span>
        ))}
        {searchTerms.length > 0 && (
          <button 
            onClick={() => {
              setSearchTerm('');
              fetchItems(selectedCategory, '');
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.8rem",
              color: "#666",
              padding: "0.25rem 0.5rem"
            }}
          >
            Clear all
          </button>
        )}
      </div>
    );
  };

  // // Remove a specific search term
  // const removeSearchTerm = (termToRemove) => {
  //   const currentTerms = parseSearchTerms(searchTerm);
  //   const updatedTerms = currentTerms.filter(term => term !== termToRemove);
  //   const newSearchTerm = updatedTerms.join(', ');
    
  //   setSearchTerm(newSearchTerm);
  //   fetchItems(selectedCategory, newSearchTerm);
  // };

  // // Clear all search terms
  // const clearAllSearchTerms = () => {
  //   setSearchTerm('');
  //   fetchItems(selectedCategory, '');
  // };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Exchange4Students Marketplace</h1>
      <h2>Select a category to browse</h2>

      {/* Category buttons */}
      <div style={{ marginBottom: "1rem" }}>
        {["Sports", "Music", "Technology", "Clothes", "Misc"].map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            style={{
              marginRight: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: selectedCategory === category ? "#ccc" : "#eee",
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Keyword Search Bar */}
      <div style={{ marginBottom: "0.5rem" }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          style={{ padding: "0.5rem", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button 
          onClick={() => {
            fetchItems(selectedCategory, searchTerm);
          }}
          style={{
            marginLeft: "0.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Search
        </button>
      </div>

      {/* Display search tags */}
      {renderSearchTags()}

      {/* Display loading, errors, or items */}
      <div className="items">
        {loading && <p>Loading items...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && selectedCategory && items.length === 0 && (
          <p>No items found for <strong>{selectedCategory}</strong>.</p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid gray",
              padding: "1rem",
              marginBottom: "1rem",
              maxWidth: "500px",
            }}
          >
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p><strong>Price:</strong> ${item.price}</p>
            <p><strong>Seller:</strong> {item.seller_username}</p>
            <p><strong>Category:</strong> {item.category || "None"}</p>

            {item.dimensions && <p><strong>Dimensions:</strong> {item.dimensions}</p>}
            {item.size && item.size !== 'N/A' && <p><strong>Size:</strong> {item.size}</p>}
            {item.color && <p><strong>Color:</strong> {item.color}</p>}

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
