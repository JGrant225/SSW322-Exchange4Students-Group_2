// Load environment variables from .env file (like PORT, DATABASE_URL, JWT_SECRET)
require("dotenv").config();

// Import core dependencies
const express = require("express");
const cors = require("cors");
const path = require("path");

// Initialize Express app
const app = express();

// Enable CORS to allow requests from the frontend
app.use(cors({
  origin: "*",
  credentials: true,
}));

// Middleware to parse incoming JSON in request bodies
app.use(express.json());

// Debug logger to trace incoming requests (can be removed in prod)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Serve uploaded images statically from /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import and mount authentication routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Import and mount item routes
const itemRoutes = require("./routes/items");
app.use("/items", itemRoutes);

// Import and mount cart routes — ensure this comes before the wildcard route
const cartRoutes = require("./routes/cart");
app.use("/cart", cartRoutes);

// Import and mount buy request routes
const buyRequestRoutes = require("./routes/buyrequests");
app.use("/buy_requests", buyRequestRoutes);

// Serve static files from the React frontend build folder
app.use(express.static(path.join(__dirname, "build")));

// Wildcard fallback: serve React frontend (must come after all API routes)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start the server on the specified port (default to 5000 if not set)
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Debug log for JWT loaded from environment
console.log("JWT loaded:", process.env.JWT_SECRET?.slice(0, 10));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});
