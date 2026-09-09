const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const https = require("https");
const fs = require("fs");

const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/report");
const postRoutes = require("./routes/post");
const communityRoutes = require("./routes/community");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/communities", communityRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("TrustNet API is running securely!");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

// HTTPS certificate
const httpsOptions = {
  pfx: fs.readFileSync("./trustnet.pfx"),
  passphrase: "TrustNet123",
};

// Start HTTPS server
const PORT = process.env.PORT || 5000;

https.createServer(httpsOptions, app).listen(PORT, "0.0.0.0", () => {
  console.log(`TrustNet HTTPS server running on port ${PORT}`);
});