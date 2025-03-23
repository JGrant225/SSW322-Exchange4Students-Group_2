import React, { useState } from "react";
import axios from "axios";

// Login component handles user authentication form
const Login = () => {
  // State to store form input values (username & password)
  const [form, setForm] = useState({ username: "", password: "" });

  // State to display feedback message (success or error)
  const [message, setMessage] = useState("");

  // Handle changes in input fields
  const handleChange = (e) => {
    // Dynamically update the form state based on input field name
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh on form submission

    try {
      // Send a POST request to the backend /auth/login route
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, form);

      // If login succeeds, show success message and store token
      setMessage("Login successful");

      // Store the JWT token in localStorage for future use (e.g., authentication)
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      // If login fails, show error message from server or fallback message
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      {/* Login form */}
      <form onSubmit={handleSubmit}>
        {/* Username input */}
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />

        {/* Password input */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />

        {/* Submit button */}
        <button type="submit">Login</button>
      </form>

      {/* Display message below the form */}
      <p>{message}</p>
    </div>
  );
};

export default Login;
