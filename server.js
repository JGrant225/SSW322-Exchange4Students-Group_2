require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const https = require("https");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Exchange4Students API is running securely...");
});

const PORT = process.env.PORT || 5000;

// Load SSL Certificate and Key
const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

// Start HTTPS server
app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });  

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
