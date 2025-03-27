import React, { useState, useEffect } from "react";
import axios from "axios";

export function Test(){
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    // Function to fetch items based on the selected category
    const fetchItems = async (category) => {
      setLoading(true);
      setError(null);
      setItems([]);
      try {
        const response = await axios.get(`http://localhost:5000/api/items/${category}`);
        
        if (Array.isArray(response.data)) {
          setItems(response.data); // Update the state to fetch items
        } else {
          setItems([]); // If not an array, reset it to avoid .map() errors
        }
      } catch (err) {
        setError('Error fetching items');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="App">
        <div className="header">
          <h1>Welcome to our Market</h1>
          <h2>Select a category</h2>
        </div>
  
        <div className="categories">
          {/* Category buttons */}
          {["Sports", "Music", "Technology", "Clothes", "Misc"].map((category) => (
          <button key={category} onClick={() => { setSelectedCategory(category); fetchItems(category); }}>
            {category}
          </button>
        ))}
        </div>
  
        <div className="items">
          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}
          
          {!loading && !error && items.length === 0 && selectedCategory && (
          <p>No items found for {selectedCategory}.</p>
        )}

        {!loading && !error && items.length > 0 && (
          items.map(item => (
            <div key={item.id} className="item">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
            ))
  
  
          )}
        </div>
        </div>
    )
   
}