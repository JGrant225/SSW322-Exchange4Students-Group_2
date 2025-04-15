import React, { useState, useEffect } from "react";
import axios from "axios";

// BrowseItems component allows buyers to browse items by category and add them to the cart
export function BrowseItems({ onCartUpdate, username, token }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [dimensionsFilter, setDimensionsFilter] = useState('');
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
      
      // Create combined search with filters
      let combinedSearch = search || '';
      
      if (sizeFilter) {
        combinedSearch += combinedSearch ? `, ${sizeFilter}` : sizeFilter;
      }
      
      if (colorFilter) {
        combinedSearch += combinedSearch ? `, ${colorFilter}` : colorFilter;
      }
      
      if (dimensionsFilter) {
        combinedSearch += combinedSearch ? `, ${dimensionsFilter}` : dimensionsFilter;
      }
      
      if (combinedSearch) {
        params.append("search", combinedSearch.trim());
      }
      
      const apiUrl = `${process.env.REACT_APP_API_URL}/items`;
      const fullUrl = `${apiUrl}${params.toString() ? `?${params.toString()}` : ''}`;
      
      console.log(`[BrowseItems] Making API request to: ${fullUrl}`);
      setDebugInfo(prev => prev + `Making request to: ${fullUrl}\n`);
      console.log(`[BrowseItems] Combined search terms: ${combinedSearch}`);
      
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

  // Keyword search function with debounce
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

  // Handle category selection
  const handleCategoryClick = (category) => {
    const newCategory = category === selectedCategory ? null : category;
    setSelectedCategory(newCategory);
    fetchItems(newCategory, searchTerm);
  };

  // Add item to cart
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

  // Render search tags
  const renderSearchTags = () => {
    const allTags = [];
    
    // Add general search terms
    if (searchTerm.trim()) {
      searchTerm.split(',')
        .map(term => term.trim())
        .filter(term => term)
        .forEach(term => allTags.push({ type: 'search', value: term }));
    }
    
    // Add specific filters
    if (sizeFilter) allTags.push({ type: 'size', value: sizeFilter });
    if (colorFilter) allTags.push({ type: 'color', value: colorFilter });
    if (dimensionsFilter) allTags.push({ type: 'dimensions', value: dimensionsFilter });
    
    if (allTags.length === 0) return null;
    
    return (
      <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {allTags.map((tag, index) => (
          <span key={index} style={{ 
            backgroundColor: getTagColor(tag.type), 
            padding: "0.25rem 0.5rem", 
            borderRadius: "16px", 
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center"
          }}>
            {tag.type !== 'search' && <strong>{tag.type}: </strong>}
            {tag.value}
            <button 
              onClick={() => {
                // Remove tag based on type
                if (tag.type === 'search') {
                  const newTerms = searchTerm.split(',')
                    .map(t => t.trim())
                    .filter(t => t !== tag.value)
                    .join(', ');
                  setSearchTerm(newTerms);
                  fetchItems(selectedCategory, newTerms);
                } else if (tag.type === 'size') {
                  setSizeFilter('');
                  fetchItems(selectedCategory, searchTerm);
                } else if (tag.type === 'color') {
                  setColorFilter('');
                  fetchItems(selectedCategory, searchTerm);
                } else if (tag.type === 'dimensions') {
                  setDimensionsFilter('');
                  fetchItems(selectedCategory, searchTerm);
                }
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
        {allTags.length > 0 && (
          <button 
            onClick={() => {
              setSearchTerm('');
              setSizeFilter('');
              setColorFilter('');
              setDimensionsFilter('');
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
  
  // Helper function for tag colors
  const getTagColor = (type) => {
    switch(type) {
      case 'size': return "#e6f7ff";
      case 'color': return "#f0f5ff";
      case 'dimensions': return "#f6ffed";
      default: return "#e1e1e1";
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

      {/* Search Bar */}
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

      {/* Additional filter fields */}
      <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <div>
          <label htmlFor="sizeFilter" style={{ fontSize: "0.9rem", marginRight: "0.25rem" }}>Size:</label>
          <select
            id="sizeFilter"
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            <option value="">Any Size</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="colorFilter" style={{ fontSize: "0.9rem", marginRight: "0.25rem" }}>Color:</label>
          <input
            type="text"
            id="colorFilter"
            placeholder="e.g. Red"
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            style={{ padding: "0.5rem", width: "100px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
        
        <div>
          <label htmlFor="dimensionsFilter" style={{ fontSize: "0.9rem", marginRight: "0.25rem" }}>Dimensions:</label>
          <input
            type="text"
            id="dimensionsFilter"
            placeholder="e.g. 10x20"
            value={dimensionsFilter}
            onChange={(e) => setDimensionsFilter(e.target.value)}
            style={{ padding: "0.5rem", width: "100px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
        
        <button 
          onClick={() => {
            fetchItems(selectedCategory, searchTerm);
          }}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Apply Filters
        </button>
        
        <button 
          onClick={() => {
            setSizeFilter('');
            setColorFilter('');
            setDimensionsFilter('');
            fetchItems(selectedCategory, searchTerm);
          }}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Clear Filters
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
              borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p><strong>Price:</strong> ${item.price}</p>
            <p><strong>Seller:</strong> {item.seller_username}</p>
            <p><strong>Category:</strong> {item.category || "None"}</p>

            {/* Always show these fields even if empty/null */}
            <p><strong>Dimensions:</strong> {item.dimensions || "Not specified"}</p>
            <p><strong>Size:</strong> {item.size && item.size !== 'N/A' ? item.size : "Not applicable"}</p>
            <p><strong>Color:</strong> {item.color || "Not specified"}</p>

            {item.image && (
              <img
                src={`${process.env.REACT_APP_API_URL}/uploads/${item.image}`}
                alt={item.title}
                style={{ width: "150px", height: "auto", marginTop: "0.5rem", borderRadius: "4px" }}
              />
            )}

            <button
              style={{ 
                marginTop: "0.5rem", 
                backgroundColor: "#007bff", 
                color: "white", 
                border: "none", 
                padding: "0.5rem 1rem", 
                borderRadius: "4px",
                cursor: "pointer"
              }}
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
