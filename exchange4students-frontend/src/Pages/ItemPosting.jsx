import React, { useState, useEffect } from "react";
// import Register from "../Components/Register";
import Login from "../Components/Login";
import PostItem from "../Components/PostItem";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";


export function ItemPosting(){
    // Track logged-in user and token (in memory only)
    const location = useLocation();
    const [username, setUsername] = useState("");
    const [token, setToken] = useState("");
    const navigate = useNavigate();   
    
    // Logout function clears state
    const handleLogout = () => {
        setUsername("");
        setToken("");
        navigate("/");
    };

    useEffect(() => {
        // Check if state was passed during navigation
        const state = location.state;
        if (state && state.username && state.token) {
          setUsername(state.username);
          setToken(state.token);
        } else {
          // If no state, redirect to login
          navigate("/");
        }
      }, [location, navigate]);

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
        <>
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
                <hr />
                <Login onLoginSuccess={handleLoginSuccess} />
                <hr />
                </>
            )}            
            {/* Always show PostItem */}
            <PostItem username={username} token={token} />
            </div> 
        </>
    )
}
