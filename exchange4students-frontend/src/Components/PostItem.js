import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// PostItem component handles the form for posting a new item
const PostItem = ({ username, token, onItemPosted }) => {
  // State to store form input values including new category field
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    dimensions: "",
    size: "",
    color: ""
  });

  const [category, setCategory] = useState("");

  // State to store selected image file
  const [image, setImage] = useState(null);

  // State to display success or error message from server
  const [message, setMessage] = useState("");

  // Boolean to track login status based on props
  const isLoggedIn = !!(username && token);

  const navigate = useNavigate();

  // Clear form state when token changes (login/logout)
  useEffect(() => {
    setForm({ title: "", description: "", price: "", category: "", dimensions: "", size: "", color: "" });
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
      setMessage("All fields including category are required");
      return;
    }

    if (isNaN(form.price) || parseFloat(form.price) <= 0) {
      setMessage("Price must be a positive number");
      return;
    }

    try {
      // Create FormData to include image
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
      setForm({ title: "", description: "", price: "", category: "", dimensions: "", size: "", color: "" });
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
    <><h2 style={{textAlign: "center"}}>Post an Item</h2><div>
      {/* If user is logged in, show form */}
      {isLoggedIn ? (
        <>
          {/* Form for submitting a new item */}
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Title input */}
            <input
              name="title"
              placeholder="Item Title"
              value={form.title}
              onChange={handleChange} 
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                color: "#2c3e50",
                margin: "0.5rem"              
              }}/><br />

            {/* Description input */}
            <textarea
              name="description"
              placeholder="Item Description"
              value={form.description}
              onChange={handleChange} 
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                color: "#2c3e50",
                margin: "0.5rem"              
              }}/><br />

            {/* Price input */}
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={handleChange} 
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                color: "#2c3e50",
                margin: "0.5rem"              
              }}/><br />

            {/* Category dropdown */}
            <select
              name="category"
              value={form.category}
              onChange={(e) => {
                handleChange(e);
                setCategory(e.target.value);
              }}
            >

              <option value="">Select Category</option>
              <option value="Sports">Sports</option>
              <option value="Music">Music</option>
              <option value="Technology">Technology</option>
              <option value="Clothes">Clothes</option>
              <option value="Misc">Misc</option>
            </select><br />

            {/* Conditional Dimensions field with dynamic placeholder */}
            {category && (
              <input
                name="dimensions"
                placeholder={
                  category === "Clothes"
                    ? "e.g. Shoulder Width x Length"
                    : category === "Technology"
                    ? "e.g. Screen Size, Depth"
                    : category === "Sports"
                    ? "e.g. Diameter, Length"
                    : "e.g. Size or Measurements"
                }
                value={form.dimensions}
                onChange={handleChange}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                  color: "#2c3e50",
                  margin: "0.5rem"
                }}
              />
            )}<br />


            {/* Show size only for Clothes */}
            {category === "Clothes" && (
              <select
                name="size"
                value={form.size}
                onChange={handleChange}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                  color: "#2c3e50",
                  margin: "0.5rem"
                }}
              >
                <option value="">Select Size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            )}<br />


            {/* Show color for specific categories */}
            {["Clothes", "Sports", "Music", "Misc"].includes(category) && (
              <input
                name="color"
                placeholder="Color (e.g. Red)"
                value={form.color}
                onChange={handleChange}               
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                  color: "#2c3e50",
                  margin: "0.5rem"              
                }}
              />
            )}<br />


            {/* File upload */}
            <label>
              Upload Image:
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "block", marginTop: "0.5rem" }} />
            </label>

            {/* Thumbnail preview */}
            {image && (
              <div style={{ marginTop: "0.5rem" }}>
                <strong>Selected file:</strong> {image.name}
                <div style={{ marginTop: "0.5rem" }}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    style={{
                      maxWidth: "200px",
                      border: "1px solid #ccc",
                      marginTop: "0.5rem"
                    }} />
                </div>
              </div>
            )}

            <br />
            <button type="submit">Post Item</button>
          </form>
        </>
      ) : (
        // If user is not logged in
        <p style={{ color: "red" }}>
          You must be logged in to post items.
        </p>
      )}

      {/* Show server feedback message */}
      {message && <p>{message}</p>}
      {/* CSS animations */}
      <style>
        {`
          form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            max-width: 500px;
            margin: 2rem auto;
            padding: 1.5rem;
            background-color: #f7f9fc;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
          }

          form input[type="text"],
          form input[type="number"],
          form input[type="file"],
          form textarea,
          form select {
            padding: 0.5rem;
            font-size: 1rem;
            border: 1px solid #ccc;
            border-radius: 6px;
            background-color: #fff;
            transition: border 0.2s ease-in-out;
            margin: 0.5rem ;
          }

          form input[type="file"] {
            padding: 0.3rem;
          }

          form input:focus,
          form textarea:focus,
          form select:focus {
            outline: none;
            border-color: #5c9ded;
          }

          form label {
            font-weight: 500;
            margin-bottom: 0.25rem;
            display: block;
          }

          form button {
            background-color: #4CAF50;
            color: white;
            padding: 0.6rem 1rem;
            font-size: 1rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }

          form button:hover {
            background-color: #3e9140;
          }
        `}
      </style>
    </div></>
  );
};

export default PostItem;
