import React, { useState, useEffect } from "react";
// import Register from "../Components/Register";
// import Login from "../Components/Login";
// import PostItem from "../Components/PostItem";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";

export function LoginPage(){
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

    // Navigate Seller function to change to Item Posting Page
    const navSeller = () => {
        try {
            const decoded = jwtDecode(token);
            setUsername(decoded.username);
            navigate("/ItemPosting", {
                state: {
                    username: decoded.username,
                    token: token
                }
            });
        } catch {
            setUsername("");
        }
    }

    
    // Navigate Buyer function to change to Item Posting Page
    const navBuyer = () => {
        try {
            const decoded = jwtDecode(token);
            setUsername(decoded.username);
            navigate("/Test", {
                state: {
                    username: decoded.username,
                    token: token
                }
            });
        } catch {
            setUsername("");
        }
    }


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
        <h2>Choose a role: </h2>
        <button onClick={navSeller}>Seller</button>
        <button onClick={navBuyer}>Buyer</button>


        </div>
    )
}

export default LoginPage;