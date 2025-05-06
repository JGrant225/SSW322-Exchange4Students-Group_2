import React, { useState, useEffect } from "react";
import axios from "axios";

//Category icons to improve UI
const categoryIcons = {
  Sports: "🏀",
  Music: "🎧",
  Technology: "🛠",
  Clothes: "👕",
  Misc: "📦"
};

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
      if (search) params.append("search", search.trim());
      if (sizeFilter) params.append("size", sizeFilter.trim());
      if (colorFilter) params.append("color", colorFilter.trim());
      if (dimensionsFilter) params.append("dimensions", dimensionsFilter.trim());

      
      const apiUrl = `${process.env.REACT_APP_API_URL}/items`;
      const fullUrl = `${apiUrl}${params.toString() ? `?${params.toString()}` : ''}`;
      
      console.log(`[BrowseItems] Making API request to: ${fullUrl}`);
      setDebugInfo(prev => prev + `Making request to: ${fullUrl}\n`);
      
      const response = await axios.get(fullUrl);
      
      console.log(`[BrowseItems] API response status: ${response.status}`);
      console.log(`[BrowseItems] Items returned: ${response.data.length}`);
      setDebugInfo(prev => prev + `Response status: ${response.status}\nItems returned: ${response.data.length}\n`);
      
      setItems(response.data.map(item => ({ ...item, showFullDesc: false })));
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
                color: "#666",
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

  // Toggles description expansion by item ID
  const toggleDescription = (itemId) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, showFullDesc: !item.showFullDesc } : item
      )
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to the Marketplace</h1>
      <h2 style={styles.subtitle}>Select a category to browse</h2>

      {/* Category buttons */}
      <div style={styles.buttonGroup}>
        {["Sports", "Music", "Technology", "Clothes", "Misc"].map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            style={{
              ...styles.categoryButton,
              backgroundColor: selectedCategory === category ? "#007bff" : "#f0f0f0",
              color: selectedCategory === category ? "#fff" : "#333",
            }}
          >
            <span style={{ marginRight: "0.5rem" }}>{categoryIcons[category]}</span>
            {category}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          style={styles.input}
        />
        <button
          onClick={() => fetchItems(selectedCategory, searchTerm)}
          style={{ ...styles.button, backgroundColor: "#4CAF50" }}
        >
          Search
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div>
          <label htmlFor="sizeFilter" style={styles.label}>Size:</label>
          <select
            id="sizeFilter"
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            style={styles.input}
          >
            <option value="">Any Size</option>
            {["XS", "S", "M", "L", "XL", "XXL"].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="colorFilter" style={styles.label}>Color:</label>
          <input
            type="text"
            id="colorFilter"
            placeholder="e.g. Red"
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            style={{ ...styles.input, width: "100px" }}
          />
        </div>

        <div>
          <label htmlFor="dimensionsFilter" style={styles.label}>Dimensions:</label>
          <input
            type="text"
            id="dimensionsFilter"
            placeholder="e.g. 10x20"
            value={dimensionsFilter}
            onChange={(e) => setDimensionsFilter(e.target.value)}
            style={{ ...styles.input, width: "100px" }}
          />
        </div>

        <button
          onClick={() => fetchItems(selectedCategory, searchTerm)}
          style={{ ...styles.button, backgroundColor: "#4CAF50" }}
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
          style={{ ...styles.button, backgroundColor: "#f44336" }}
        >
          Clear Filters
        </button>
      </div>

      {/* Tags */}
      {renderSearchTags()}

      {/* Results */}
      <div style={styles.results}>
        {loading && <p>Loading items...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && selectedCategory && items.length === 0 && (
          <p>No items found for <strong>{selectedCategory}</strong>.</p>
        )}

        {items.map((item) => (
          <div key={item.id} style={styles.card} className="fade-in">
            <h3>{item.title}</h3>
            {item.description && (
              <p className="clamp-description">
                {item.description}
              </p>
            )}
            <div style={styles.metadataGrid}>
              <div><strong>Price:</strong> ${item.price}</div>
              <div><strong>Seller:</strong> {item.seller_username}</div>
              <div><strong>Category:</strong> {item.category || "None"}</div>
              <div><strong>Dimensions:</strong> {item.dimensions || "Not specified"}</div>
              <div><strong>Size:</strong> {item.size && item.size !== 'N/A' ? item.size : "Not applicable"}</div>
              <div><strong>Color:</strong> {item.color || "Not specified"}</div>
              <div><strong>Item Status:</strong> {item.itemstatus || "Available"}</div>
            </div>


            {item.image && (
              <img
                src={`${process.env.REACT_APP_API_URL}/uploads/${item.image}`}
                alt={item.title}
                style={styles.image}
              />
            )}

            <div style={{ marginTop: "auto" }}>
              {item.itemstatus === "Available" ? (
                <button
                  style={{ ...styles.button, backgroundColor: "#007bff", width: "100%", marginTop: "1rem" }}
                  onClick={() => handleAddToCart(item.id)}
                >
                  Add to Cart
                </button>
              ) : (
                <p style={{ color: "red", fontWeight: "bold", marginTop: "1rem" }}>
                  Item not available for purchase ({item.itemstatus})
                </p>
              )}
            </div>


          </div>
        ))}
      </div>

      {/* CSS animations */}
      <style>
        {`
          .fade-in {
            opacity: 0;
            transform: translateY(10px);
            animation: fadeInUp 0.4s ease-out forwards;
          }

          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .clamp-description {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 0.75rem;
          }

          button {
            transition: all 0.2s ease;
          }

          button:hover {
            filter: brightness(90%);
            box-shadow: 0 3px 6px rgba(0,0,0,0.15);
            transform: scale(1.02);
          }

          button:active {
            transform: scale(0.96);
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1100px",
    margin: "auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    color: "#2c3e50"
  },
  title: {
    color: "#2c3e50",
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "0.25rem",
    textAlign: "center"
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "1.25rem",
    fontWeight: "500",
    marginBottom: "1.5rem",
    textAlign: "center"
  },
  buttonGroup: {
    marginBottom: "1rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    justifyContent: "center"
  },
  categoryButton: {
    padding: "0.6rem 1rem",
    fontSize: "0.8rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#e0e0e0",
    color: "#2c3e50",
    fontWeight: "600",
    cursor: "pointer"
  },
  searchContainer: {
    marginBottom: "1.5rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    alignItems: "center"
  },
  input: {
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    color: "#2c3e50"
  },
  button: {
    padding: "0.5rem 1rem",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  filters: {
    marginBottom: "1.5rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    alignItems: "center"
  },
  label: {
    fontSize: "0.9rem",
    marginRight: "0.25rem",
    fontWeight: "500",
    color: "#2c3e50"
  },
  results: {
    marginTop: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1.5rem"
  },
  card: {
    border: "1px solid #ddd",
    padding: "1rem",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    lineHeight: "1.6",
    fontSize: "0.95rem",
    color: "#2c3e50",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  image: {
    width: "100%",
    height: "auto",
    marginTop: "0.5rem",
    marginBottom: "1rem",
    borderRadius: "6px",
    objectFit: "cover",
    display: "block"
  },
  metadataGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.25rem 0.5rem",
    marginTop: "0.5rem",
    fontSize: "0.85rem"
  }  
};

export default BrowseItems;
