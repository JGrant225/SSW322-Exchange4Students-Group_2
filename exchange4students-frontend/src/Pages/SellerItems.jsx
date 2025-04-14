import React, { useState, useEffect } from "react";
import axios from "axios";

// SellerItems component allows the seller to view, edit, and delete their own items
export default function SellerItems({ username, token, refreshTrigger }) {
  // State to hold all items posted by this seller
  const [items, setItems] = useState([]);

  // State to track which item is being edited
  const [editingItemId, setEditingItemId] = useState(null);

  // State for edit form inputs - now including dimensions, size, and color
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    image: null,
    category: "",
    dimensions: "",
    size: "",
    color: ""
  });

  // Fetch seller's items whenever dependencies change
  useEffect(() => {
    const fetchItems = async () => {
      if (!username || !token) return;

      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/items`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Filter items by seller
        const sellerItems = res.data.filter(
          (item) => item.seller_username === username
        );

        setItems(sellerItems);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };

    fetchItems();
  }, [username, token, refreshTrigger]);

  // Delete an item
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/items/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  // Set up edit form for selected item
  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    setEditForm({
      title: item.title,
      description: item.description,
      price: item.price,
      image: null,
      category: item.category || "", // Default to current category if available
      dimensions: item.dimensions || "",
      size: item.size || "",
      color: item.color || ""
    });
  };

  // Update form text fields
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Update selected image file
  const handleImageChange = (e) => {
    setEditForm({ ...editForm, image: e.target.files[0] });
  };

  // Submit updated item to backend
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("description", editForm.description);
      formData.append("price", editForm.price);
      if (editForm.image) {
        formData.append("image", editForm.image);
      }
      if (editForm.category) {
        formData.append("category", editForm.category);
      }
      
      // Add new fields to the form data
      formData.append("dimensions", editForm.dimensions);
      formData.append("size", editForm.size);
      formData.append("color", editForm.color);

      await axios.put(
        `${process.env.REACT_APP_API_URL}/items/${editingItemId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // Re-fetch items to refresh UI
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/items`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const sellerItems = res.data.filter(
        (item) => item.seller_username === username
      );

      setItems(sellerItems);
      setEditingItemId(null);
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  return (
    <div>
      <h2>Your Posted Items</h2>

      {items.length === 0 && <p>You have not posted any items yet.</p>}

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid gray",
            padding: "1rem",
            marginBottom: "1rem"
          }}
        >
          {editingItemId === item.id ? (
            // Editing form
            <form onSubmit={handleEditSubmit} encType="multipart/form-data">
              <div style={{ marginBottom: "10px" }}>
                <label>Title:</label><br />
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  style={{ width: "100%" }}
                />
              </div>
              
              <div style={{ marginBottom: "10px" }}>
                <label>Description:</label><br />
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  style={{ width: "100%", height: "100px" }}
                />
              </div>
              
              <div style={{ marginBottom: "10px" }}>
                <label>Price ($):</label><br />
                <input
                  name="price"
                  type="number"
                  value={editForm.price}
                  onChange={handleEditChange}
                  style={{ width: "100%" }}
                />
              </div>

              {/* Category selection dropdown */}
              <div style={{ marginBottom: "10px" }}>
                <label>Category:</label><br />
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  style={{ width: "100%" }}
                >
                  <option value="">(No Change)</option>
                  <option value="Sports">Sports</option>
                  <option value="Music">Music</option>
                  <option value="Technology">Technology</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Misc">Misc</option>
                </select>
              </div>
              
              {/* New Fields - Dimensions */}
              <div style={{ marginBottom: "10px" }}>
                <label>Dimensions:</label><br />
                <input
                  name="dimensions"
                  placeholder="e.g., 10x20x5 inches"
                  value={editForm.dimensions}
                  onChange={handleEditChange}
                  style={{ width: "100%" }}
                />
              </div>
              
              {/* New Fields - Size */}
              <div style={{ marginBottom: "10px" }}>
                <label>Size:</label><br />
                <select
                  name="size"
                  value={editForm.size}
                  onChange={handleEditChange}
                  style={{ width: "100%" }}
                >
                  <option value="">Select Size (if applicable)</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="N/A">Not Applicable</option>
                </select>
              </div>
              
              {/* New Fields - Color */}
              <div style={{ marginBottom: "10px" }}>
                <label>Color:</label><br />
                <input
                  name="color"
                  placeholder="e.g., Red, Blue, Black"
                  value={editForm.color}
                  onChange={handleEditChange}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label>Image:</label><br />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* Image preview if a new image is selected */}
              {editForm.image && (
                <div style={{ marginTop: "0.5rem", marginBottom: "10px" }}>
                  <strong>New image:</strong>
                  <img
                    src={URL.createObjectURL(editForm.image)}
                    alt="New Preview"
                    style={{ width: "150px", marginTop: "0.5rem" }}
                  />
                </div>
              )}
              
              <div style={{ marginBottom: "10px" }}>
                <button 
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "10px"
                  }}
                >
                  Save
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingItemId(null)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // Read-only view
            <>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p>Price: ${item.price}</p>
              <p>Category: {item.category || "N/A"}</p>
              
              {/* Display the new fields if they exist */}
              {item.dimensions && <p>Dimensions: {item.dimensions}</p>}
              {item.size && item.size !== "N/A" && <p>Size: {item.size}</p>}
              {item.color && <p>Color: {item.color}</p>}
              
              {item.image && (
                <img
                  src={`${process.env.REACT_APP_API_URL}/uploads/${item.image}`}
                  alt={item.title}
                  style={{ width: "150px", height: "auto" }}
                />
              )}
              <br />
              <button 
                onClick={() => handleEditClick(item)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "10px",
                  marginTop: "10px"
                }}
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "10px"
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
