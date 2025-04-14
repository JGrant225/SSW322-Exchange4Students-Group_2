import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// PostItem component handles the form for posting a new item
const PostItem = ({ username, token, onItemPosted }) => {
  // State to store form input values including new fields
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    dimensions: "",
    size: "",
    color: ""
  });

  // State to store selected image file
  const [image, setImage] = useState(null);

  // State to display success or error message from server
  const [message, setMessage] = useState("");

  // Boolean to track login status based on props
  const isLoggedIn = !!(username && token);

  const navigate = useNavigate();

  // Clear form state when token changes (login/logout)
  useEffect(() => {
    setForm({ 
      title: "", 
      description: "", 
      price: "", 
      category: "",
      dimensions: "",
      size: "",
      color: ""
    });
    setImage(null);
    setMessage("");
  }, [token]);

  // Handle typing in input fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file upload
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle logout - navigates back to homepage
  const handleLogout = () => {
    navigate("/", {
      state: {
        username: "",
        token: ""
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent post if no token
    if (!token) {
      setMessage("You must be logged in to post an item.");
      return;
    }

    // Input validation
    if (!form.title || !form.description || !form.price || !form.category) {
      setMessage("Title, description, price, and category are required");
      return;
    }

    if (isNaN(form.price) || parseFloat(form.price) <= 0) {
      setMessage("Price must be a positive number");
      return;
    }

    try {
      // Create FormData to include image and all form fields
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("dimensions", form.dimensions);
      formData.append("size", form.size);
      formData.append("color", form.color);
      
      if (image) {
        formData.append("image", image);
      }

      // Send POST request to backend with token in header
      await axios.post(
        `${process.env.REACT_APP_API_URL}/items`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // Reset form and show confirmation
      setMessage("Item posted successfully!");
      setForm({ 
        title: "", 
        description: "", 
        price: "", 
        category: "",
        dimensions: "",
        size: "",
        color: ""
      });
      setImage(null);

      // Trigger parent refresh (used in SellerItems)
      if (onItemPosted) {
        onItemPosted();
      }
    } catch (err) {
      // Display error message from backend or fallback
      console.error("Error posting item:", err);
      setMessage(err.response?.data?.message || "Failed to post item");
    }
  };

  return (
    <div>
      {/* If user is logged in, show form */}
      {isLoggedIn ? (
        <>
          <p>Logged in as: <strong>{username}</strong></p>
          <button onClick={handleLogout}>Logout</button>
          <h2>Post an Item</h2>

          {/* Form for submitting a new item */}
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Title input */}
            <div style={{ marginBottom: "10px" }}>
              <label>Title:</label><br />
              <input
                name="title"
                placeholder="Item Title"
                value={form.title}
                onChange={handleChange}
                style={{ width: "300px", padding: "5px" }}
              />
            </div>

            {/* Description input */}
            <div style={{ marginBottom: "10px" }}>
              <label>Description:</label><br />
              <textarea
                name="description"
                placeholder="Item Description"
                value={form.description}
                onChange={handleChange}
                style={{ width: "300px", height: "100px", padding: "5px" }}
              />
            </div>

            {/* Price input */}
            <div style={{ marginBottom: "10px" }}>
              <label>Price ($):</label><br />
              <input
                name="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                style={{ width: "300px", padding: "5px" }}
              />
            </div>

            {/* Category dropdown */}
            <div style={{ marginBottom: "10px" }}>
              <label>Category:</label><br />
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{ width: "300px", padding: "5px" }}
              >
                <option value="">Select Category</option>
                <option value="Sports">Sports</option>
                <option value="Music">Music</option>
                <option value="Technology">Technology</option>
                <option value="Clothes">Clothes</option>
                <option value="Misc">Misc</option>
              </select>
            </div>

            {/* Dimensions input */}
            <div style={{ marginBottom: "10px" }}>
              <label>Dimensions:</label><br />
              <input
                name="dimensions"
                placeholder="e.g., 10x20x5 inches"
                value={form.dimensions}
                onChange={handleChange}
                style={{ width: "300px", padding: "5px" }}
              />
            </div>

            {/* Size input */}
            <div style={{ marginBottom: "10px" }}>
              <label>Size:</label><br />
              <select
                name="size"
                value={form.size}
                onChange={handleChange}
                style={{ width: "300px", padding: "5px" }}
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

            {/* Color input - NEW */}
            <div style={{ marginBottom: "10px" }}>
              <label>Color:</label><br />
              <input
                name="color"
                placeholder="e.g., Red, Blue, Black"
                value={form.color}
                onChange={handleChange}
                style={{ width: "300px", padding: "5px" }}
              />
            </div>

            {/* File upload */}
            <div style={{ marginBottom: "10px" }}>
              <label>Upload Image:</label><br />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ marginTop: "5px" }}
              />
            </div>

            {/* Thumbnail preview */}
            {image && (
              <div style={{ marginBottom: "10px" }}>
                <strong>Selected file:</strong> {image.name}
                <div style={{ marginTop: "5px" }}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    style={{
                      maxWidth: "200px",
                      border: "1px solid #ccc"
                    }}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Post Item
            </button>
          </form>
        </>
      ) : (
        // If user is not logged in
        <p style={{ color: "red" }}>
          You must be logged in to post items.
        </p>
      )}

      {/* Show server feedback message */}
      {message && (
        <p style={{ 
          marginTop: "10px", 
          padding: "10px", 
          backgroundColor: message.includes("successfully") ? "#dff0d8" : "#f2dede",
          color: message.includes("successfully") ? "#3c763d" : "#a94442",
          borderRadius: "4px"
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default PostItem;

