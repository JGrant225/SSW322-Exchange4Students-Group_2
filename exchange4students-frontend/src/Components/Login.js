import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

// Login component handles user authentication form
const Login = ({ onLoginSuccess }) => {
  // State to store form input values
  const [form, setForm] = useState({ username: "", password: "" });

  // State to show login result message
  const [message, setMessage] = useState("");

    // State to manage password visibility
    const [showPassword, setShowPassword] = useState(false);

  // Handle form input updates
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send POST request to backend
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, form);

      // Notify App component of login
      if (onLoginSuccess) {
        onLoginSuccess(res.data.token);
      }

      // Set success message
      setMessage("Login successful");
    } catch (err) {
      // Show error message
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />

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

        <button className="login-button" type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Login;
