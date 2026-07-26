// Environment variables
require("dotenv").config();

// Template engine
const ejs = require("ejs");

// Core framework and middleware
const express = require("express");
const session = require("express-session");
const expressSanitizer = require("express-sanitizer");

// Utilities
const path = require("path");

// Database
const mysql = require("mysql2");

// =========================
// Database connection pool
// =========================
const db = mysql.createPool({
  host: process.env.HEALTH_HOST,
  user: process.env.HEALTH_USER,
  password: process.env.HEALTH_PASSWORD,
  database: process.env.HEALTH_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Make database accessible throughout the app
global.db = db;

// =========================
// App setup
// =========================
const app = express();
app.set("trust proxy", 1);
const port = 8000;

// =========================
// View engine & middleware
// =========================
app.set("view engine", "ejs");

// Sanitize user input to prevent XSS
app.use(expressSanitizer());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, images, client-side JS)
app.use(express.static(path.join(__dirname, "public")));

// =========================
// Session configuration
// =========================
app.use(
  session({
    secret: "somerandomstuff",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 600000, // Session expires after 10 minutes
    },
  }),
);

// =========================
// Global application data
// =========================
const shopData = {
  shopName: "Health & Fitness",
};

// Make common data available to all views
app.use((req, res, next) => {
  res.locals.shopName = shopData.shopName;
  res.locals.user = req.session.user || null;
  res.locals.basePath = process.env.HEALTH_BASE_PATH || "";
  next();
});

// =========================
// Routes
// =========================
const mainRoutes = require("./routes/main");
app.use("/", mainRoutes);

// =========================
// Start server
// =========================
app.listen(port, () => console.log(`Server running on: ${port}`));
