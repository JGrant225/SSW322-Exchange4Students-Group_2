import React, { useState, useRef, useEffect } from "react";

export default function AIAssistant({ currentTab = "buyer" }) {
  const [messages, setMessages] = useState([
    { content: "Hello! I'm your AI assistant. How can I help you today? Need help posting an item or how to browse?", role: "assistant" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;

    const userMessage = { content: inputMessage, role: "user" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const systemPrompt = {
        role: "system",
        content:
            currentTab === "seller"
            ? "You are an assistant that creates high-quality, engaging product listing descriptions for marketplace items. Write concise, attractive descriptions using the provided details. Before generating the description, make sure to receive all important details from the user first. Do NOT give the user the description unless they provide these details, it is crucial."
            : "You are an AI assistant that helps users navigate a marketplace app. Your role is to guide buyers through the app’s features and answer any questions they have. Assist users with actions such as applying search filters (including clothing sizes, color, and item dimensions), sending purchase requests through the checkout process, and viewing their orders or request history. Let users know that order and request details can be accessed from the menu button (three horizontal lines) located in the top-left corner of the app and under the 'Orders and Requests' tab. This tab will show all past orders and requests without additional clicking. To send a buy request, users should click the 'Add to Cart' button and fill out the checkout form with their personal contact details (name, phone number, email). Always provide clear, friendly, and concise instructions that make it easy for users to take their next step."
        };

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [systemPrompt, ...updatedMessages],
          max_tokens: 150
        })
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";
      setMessages(prev => [...prev, { content: reply, role: "assistant" }]);
    } catch (err) {
      console.error("API Error:", err);
      setMessages(prev => [...prev, { content: "Sorry, I encountered an error. Please try again later.", role: "assistant" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#2b5876",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "56px",
          height: "56px",
          fontSize: "1.5rem",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          zIndex: 9999
        }}
      >
        {isOpen ? "×" : "💬"}
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "360px",
            maxHeight: "500px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            zIndex: 9999
          }}
        >
          <div
            style={{
              padding: "1rem",
              overflowY: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              maxHeight: "360px"
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.role === "user" ? "#2b5876" : "#f0f0f0",
                  color: msg.role === "user" ? "white" : "black",
                  padding: "0.75rem 1rem",
                  borderRadius: "1rem",
                  marginBottom: "0.5rem",
                  maxWidth: "80%",
                  wordBreak: "break-word"
                }}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#f0f0f0",
                  padding: "0.75rem 1rem",
                  borderRadius: "1rem",
                  marginBottom: "0.5rem"
                }}
              >
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} style={{ display: "flex", borderTop: "1px solid #ccc" }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "0.6rem",
                border: "none",
                outline: "none",
                fontSize: "14px",
                borderTopLeftRadius: "10px"
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: "#2b5876",
                color: "white",
                border: "none",
                padding: "0 1rem",
                cursor: isLoading ? "not-allowed" : "pointer"
              }}
            >
              {isLoading ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}

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
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </>
  );
}
