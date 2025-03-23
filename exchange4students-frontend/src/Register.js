import React, { useState } from "react";
import axios from "axios";

// Register component handles user registration form
const Register = () => {
  // State to store form input values (username & password)
  const [form, setForm] = useState({ username: "", password: "" });

  // State to store server response message (success or error)
  const [message, setMessage] = useState("");

  // Handle changes in the input fields
  const handleChange = (e) => {
    // Update form state dynamically based on input name
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh on submit
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
    <div>
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
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />

        {/* Submit button */}
        <button type="submit">Register</button>
      </form>

      {/* Show message below the form */}
      <p>{message}</p>
    </div>
  );
};

export default Register;
