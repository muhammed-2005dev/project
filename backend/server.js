const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
require("dotenv").config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// MongoDB connection (optional for development)
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/autologic", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.warn("MongoDB connection failed, using mock data:", error.message);
    // Continue without MongoDB for development
  });

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/services", require("./routes/services"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/blog", require("./routes/blog"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/admin", require("./routes/admin"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "AutoLogic API is running",
    timestamp: new Date().toISOString(),
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      status: "error",
      message: "Duplicate field value",
    });
  }

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
