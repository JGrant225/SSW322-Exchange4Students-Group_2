import React, { useState, useRef, useEffect } from "react";
import Register from "../Components/Register";
import Login from "../Components/Login";
// import PostItem from "../Components/PostItem";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function Home(){
  // Track logged-in user and token (in memory only)
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  // Chatbot states
  const [messages, setMessages] = useState([
    {
      content: "Hello! I'm your AI assistant. How can I help you today?",
      role: "assistant"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Logout function clears state
  const handleLogout = () => {
    setUsername("");
    navigate("/");
  };

  // Called when login is successful
  const handleLoginSuccess = (newToken) => {
    try {
      const decoded = jwtDecode(newToken);
      setUsername(decoded.username);
      navigate("/LoginPage", {
        state: {
          username: decoded.username,
          token: newToken
        }
      });
    } catch {
      setUsername("");
    }
  };

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (inputMessage.trim() === "") return;
    
    // Add user message to chat
    const userMessage = { content: inputMessage, role: "user" };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      // Replace with your actual API endpoint and key handling
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: 150
        })
      });
      
      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        setMessages(prev => [
          ...prev,
          { content: data.choices[0].message.content, role: "assistant" }
        ]);
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      setMessages(prev => [
        ...prev,
        { content: "Sorry, I encountered an error. Please try again later.", role: "assistant" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1
        style={{
          textAlign: "center",
        }}
      >Welcome to Exchange4Students!</h1>

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

      {/* Custom ChatGPT chatbot */}
      <div>
        <h2>AI Assistant</h2>
        <div 
          style={{
            width: "700px",
            maxWidth: "100%",
            height: "500px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            overflow: "auto",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: message.role === "user" ? "#2b5876" : "#f0f0f0",
                color: message.role === "user" ? "white" : "black",
                padding: "0.75rem 1rem",
                borderRadius: "1rem",
                marginBottom: "0.5rem",
                maxWidth: "80%",
                wordBreak: "break-word"
              }}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#f0f0f0",
                color: "black",
                padding: "0.75rem 1rem",
                borderRadius: "1rem",
                marginBottom: "0.5rem"
              }}
            >
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={sendMessage} style={{ display: "flex", width: "700px", maxWidth: "100%" }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "8px 0 0 8px",
              border: "1px solid #ccc",
              borderRight: "none"
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#2b5876",
              color: "white",
              border: "none",
              borderRadius: "0 8px 8px 0",
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
        
        <style jsx>{`
          .typing-indicator {
            display: flex;
            padding: 4px;
          }
          
          .typing-indicator span {
            height: 10px;
            width: 10px;
            background-color: #666;
            border-radius: 50%;
            display: inline-block;
            margin: 0 2px;
            animation: bounce 1.4s infinite ease-in-out both;
          }
          
          .typing-indicator span:nth-child(1) {
            animation-delay: -0.32s;
          }
          
          .typing-indicator span:nth-child(2) {
            animation-delay: -0.16s;
          }
          
          @keyframes bounce {
            0%, 80%, 100% { 
              transform: scale(0);
            } 40% { 
              transform: scale(1.0);
            }
          }
        `}</style>
      </div>

    </div>
  );
}
