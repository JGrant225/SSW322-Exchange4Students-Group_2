import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// PostItem component handles the form for posting a new item
const PostItem = ({ username, token }) => {
  // State to store form input values
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: ""
  });

  // State to store selected image file
  const [image, setImage] = useState(null);

  // State to display success or error message from server
  const [message, setMessage] = useState("");

  // Determine login status based on presence of username and token
  const isLoggedIn = !!(username && token);

  const navigate = useNavigate();

  // Clear form and message whenever token changes (user logs in or out)
  useEffect(() => {
    setForm({ title: "", description: "", price: "" });
    setImage(null);
    setMessage("");
  }, [token]);

  // Handle changes in form text input fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file input change
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Logout function clears state
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

    // Prevent posting if no token
    if (!token) {
      setMessage("You must be logged in to post an item.");
      return;
    }

    // Basic field validation
    if (!form.title || !form.description || !form.price) {
      setMessage("All fields are required");
      return;
    }

    // Price must be a number and greater than zero
    if (isNaN(form.price) || parseFloat(form.price) <= 0) {
      setMessage("Price must be a positive number");
      return;
    }

    try {
      // Use FormData to send text fields and image file
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      if (image) {
        formData.append("image", image);
      }

      // Send POST request with Authorization header
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

      // On success, show confirmation and reset form
      setMessage("Item posted successfully!");
      setForm({ title: "", description: "", price: "" });
      setImage(null);
    } catch (err) {
      // On error, show error message from server or fallback
      console.error("Error posting item:", err);
      setMessage(err.response?.data?.message || "Failed to post item");
    }
  };

  return (
    <div>
      {/* If user is logged in, show the form */}
      {isLoggedIn ? (
        <>
          <p>Logged in as: <strong>{username}</strong></p>
          <button onClick={handleLogout}>Logout</button>
          <h2>Post an Item</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Item title */}
            <input
              name="title"
              placeholder="Item Title"
              value={form.title}
              onChange={handleChange}
            /><br/>

            {/* Description */}
            <textarea
              name="description"
              placeholder="Item Description"
              value={form.description}
              onChange={handleChange}
            /><br/>

            {/* Price */}
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
            /><br/>

            {/* Image upload */}
            <label>
              Upload Image:
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "block", marginTop: "0.5rem" }}
              />
            </label>

            {/* Preview selected image filename and thumbnail */}
            {image && (
              <div style={{ marginTop: "0.5rem" }}>
                <strong>Selected file:</strong> {image.name}
                <div style={{ marginTop: "0.5rem" }}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    style={{ maxWidth: "200px", border: "1px solid #ccc", marginTop: "0.5rem" }}
                  />
                </div>
              </div>
            )}

            {/* Submit button */}
            <br />
            <button type="submit">Post Item</button>
          </form>
        </>
      ) : (
        // If not logged in, show warning message
        <p style={{ color: "red" }}>
          You must be logged in to post items.
        </p>
      )}

      {/* Display server response or feedback message */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default PostItem;
