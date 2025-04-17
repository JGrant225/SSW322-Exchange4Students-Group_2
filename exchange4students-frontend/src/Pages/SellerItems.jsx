import React, { useState, useEffect } from "react";
import axios from "axios";

// SellerItems component allows the seller to view, edit, and delete their own items
export default function SellerItems({ username, token, refreshTrigger }) {
  // State to hold all items posted by this seller
  const [items, setItems] = useState([]);

  // State to track which item is being edited
  const [editingItemId, setEditingItemId] = useState(null);

  // State for edit form inputs
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    image: null,
    category: "",
    dimensions: "",
    size: "",
    color: "",
    itemstatus: ""
  });

  const inputStyle = {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box",
  };
  
  const textareaStyle = {
    ...inputStyle,
    minHeight: "80px",
  };
  
  const selectStyle = {
    ...inputStyle,
  };
  
  const buttonStyle = {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };
  
  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#777",
  };
  
  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#e53935",
  };
  
  const metaStyle = {
    margin: "0.25rem 0",
    color: "#555",
  };

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
      category: item.category || "",
      dimensions: item.dimensions || "",
      size: item.size || "",
      color: item.color || "",
      itemstatus: item.itemstatus || "Available"
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
      formData.append("itemstatus", editForm.itemstatus);
      if (editForm.image) {
        formData.append("image", editForm.image);
      }
      if (editForm.category) {
        formData.append("category", editForm.category);
      }
      if (editForm.dimensions) {
        formData.append("dimensions", editForm.dimensions);
      }
      if (editForm.size) {
        formData.append("size", editForm.size);
      }
      if (editForm.color) {
        formData.append("color", editForm.color);
      }

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
        (item) => item.seller_username?.toLowerCase() === username.toLowerCase()
      );

      setItems(sellerItems);
      setEditingItemId(null);
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  const styles = {
    subtitle: {
      fontWeight: "600",
      color: "#333",
      marginBottom: "1rem",
    },
    results: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "1rem",
    },
    card: {
      border: "1px solid #ddd",
      padding: "1rem",
      borderRadius: "8px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    input: {
      padding: "0.5rem",
      borderRadius: "4px",
      border: "1px solid #ccc",
      width: "100%",
      boxSizing: "border-box",
    },
    button: {
      padding: "0.5rem 1rem",
      borderRadius: "4px",
      border: "none",
      color: "#fff",
      cursor: "pointer",
    },
    image: {
      maxWidth: "100%",
      height: "auto",
      marginTop: "0.5rem",
    },
  };  

  return (
    <div style={{ marginTop: "2rem" }}>
    <h2 style={{ ...styles.subtitle, fontSize: "1.5rem" }}>Your Posted Items</h2>

    {items.length === 0 && (
      <p style={{ textAlign: "center", color: "#6c757d" }}>
        You have not posted any items yet.
      </p>
    )}

    <div style={styles.results}>
      {items.map((item) => (
        <div key={item.id} style={styles.card} className="fade-in">
          {editingItemId === item.id ? (
            <form
              onSubmit={handleEditSubmit}
              encType="multipart/form-data"
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
            >
              <input
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                placeholder="Title"
                style={{
                  padding: "20px",
                  backgroundColor: "yellow",
                  fontSize: "1.5rem"}}
              />
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                placeholder="Description"
                style={{ ...styles.input, minHeight: "80px" }}
              />
              <input
                name="price"
                type="number"
                value={editForm.price}
                onChange={handleEditChange}
                placeholder="Price"
                style={styles.input}
              />
              <label>
                Category:
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  style={styles.input}
                >
                  <option value="">(No Change)</option>
                  <option value="Sports">Sports</option>
                  <option value="Music">Music</option>
                  <option value="Technology">Technology</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Misc">Misc</option>
                </select>
              </label>

              <input
                name="dimensions"
                value={editForm.dimensions}
                onChange={handleEditChange}
                placeholder="Dimensions (e.g. 10x20)"
                style={styles.input}
              />

              <label>
                Size:
                <select
                  name="size"
                  value={editForm.size}
                  onChange={handleEditChange}
                  style={styles.input}
                >
                  <option value="">(No Change)</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </label>

              <input
                name="color"
                value={editForm.color}
                onChange={handleEditChange}
                placeholder="Color (e.g. Red)"
                style={styles.input}
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={styles.input}
              />

              <label>
                Item Status:
                <select
                  name="itemstatus"
                  value={editForm.itemstatus}
                  onChange={handleEditChange}
                  style={styles.input}
                >
                  <option value="Available">Available</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Sold">Sold</option>
                </select>
              </label>

              {editForm.image && (
                <div>
                  <strong>New image:</strong>
                  <img
                    src={URL.createObjectURL(editForm.image)}
                    alt="Preview"
                    style={styles.image}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="submit" style={{ ...styles.button, backgroundColor: "#4CAF50" }}>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItemId(null)}
                  style={{ ...styles.button, backgroundColor: "#777" }}
                >
                  Cancel
                </button>
              </div>  
            </form>
          ) : (
            <>
              <h3 style={{ marginBottom: "0.5rem" }}>{item.title}</h3>
              <p>{item.description}</p>
              <p><strong>Price:</strong> ${item.price}</p>
              <p><strong>Category:</strong> {item.category || "N/A"}</p>
              <p><strong>Dimensions:</strong> {item.dimensions || "Not specified"}</p>
              <p><strong>Size:</strong> {item.size || "Not specified"}</p>
              <p><strong>Color:</strong> {item.color || "Not specified"}</p>
              <p><strong>Item Status:</strong> {item.itemstatus || "Available"}</p>

              {item.image && (
                <img
                  src={`${process.env.REACT_APP_API_URL}/uploads/${item.image}`}
                  alt={item.title}
                  style={styles.image}
                />
              )}

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <button
                  onClick={() => handleEditClick(item)}
                  style={{ ...styles.button, backgroundColor: "#007bff" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{ ...styles.button, backgroundColor: "#f44336" }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
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

        button {
          transition: all 0.2s ease;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          border: none;
          background-color: #4caf50;
          color: #fff;
          cursor: pointer;
        }

        .save {
          background-color: #4caf50;
        }
        .save:hover {
          background-color: #388e3c;
        }

        .cancel {
          background-color: #777;
        }
        .cancel:hover {
          background-color: #555;
        }

        .edit {
          background-color: #007bff;
        }
        .edit:hover {
          background-color: #0056b3;
        }

        .delete {
          background-color: #f44336;
        }
        .delete:hover {
          background-color: #d32f2f;
        }

        button:hover {
          filter: brightness(90%);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
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