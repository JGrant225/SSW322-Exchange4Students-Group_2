import React, { useState } from "react";
import Register from "./Register";
import Login from "./Login";
import PostItem from "./PostItem";
import { jwtDecode } from "jwt-decode";

function App() {
  // Track logged-in user and token (in memory only)
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");

  // Logout function clears state
  const handleLogout = () => {
    setUsername("");
    setToken("");
  };

  // Called when login is successful
  const handleLoginSuccess = (newToken) => {
    try {
      const decoded = jwtDecode(newToken);
      setUsername(decoded.username);
      setToken(newToken);
    } catch {
      setUsername("");
      setToken("");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Exchange4Students</h1>

      {/* If logged in, show logout info */}
      {username && (
        <div>
          <p>Logged in as: <strong>{username}</strong></p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Show Register and Login only when not logged in */}
      {!username && (
        <>
          <Register />
          <hr />
          <Login onLoginSuccess={handleLoginSuccess} />
          <hr />
        </>
      )}

      {/* Always show PostItem */}
      <PostItem username={username} token={token} />
    </div>
  );
}

export default App;
