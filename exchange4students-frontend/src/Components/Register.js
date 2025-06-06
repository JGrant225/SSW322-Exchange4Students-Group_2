import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

// Register component handles user registration form
const Register = () => {
  // State to store form input values (username & password)
  const [form, setForm] = useState({ username: "", password: "" });

  // State to store server response message (success or error)
  const [message, setMessage] = useState("");

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Handle changes in the input fields
  const handleChange = (e) => {
    // Update form state dynamically based on input name
    setForm({ ...form, [e.target.name]: e.target.value });
  };

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent page refresh on submit

  // Client-side validation for empty fields
  if (!form.username && !form.password) {
    setMessage("Username and password cannot be empty");
    return;
  }
  if (!form.username) {
    setMessage("Username cannot be empty");
    return;
  }
  if (!form.password) {
    setMessage("Password cannot be empty");
    return;
  }

  try {
    // Send POST request to backend /auth/register route
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, form);

    // If successful, display success message from server
    setMessage(res.data.message);

  } catch (err) {

    // If error, display error message from server or fallback text
    setMessage(err.response?.data?.message || "Registration failed");
    
  }
};

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        {/* Input for username */}
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />
        {/* Input for password */}
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          onChange={handleChange}
          value={form.password}
        />   
        <button
          type="button"
          className="password-button"
          onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? "Hide Password" : "Show Password"}
        </button>

        {/* Submit button */}
        <button className="register-button" type="submit">Register</button>
      </form>

      {/* Show message below the form */}
      <p>{message}</p>
    </div>
  );
};

export default Register;