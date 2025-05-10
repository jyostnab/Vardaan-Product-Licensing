
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mysql = require('mysql2/promise');

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*"
}));

// Parse requests of content-type - application/json
app.use(bodyParser.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Create database if it doesn't exist
async function initializeDatabase() {
  try {
    // Create connection to MySQL server without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || ""
    });
    
    console.log("Connected to MySQL server");
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "vardaan_licensing"}`);
    console.log(`Database ${process.env.DB_NAME || "vardaan_licensing"} created or already exists`);
    
    await connection.end();
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  }
}

// Initialize database before connecting with Sequelize
initializeDatabase().then(() => {
  // Database connection and sync
  const db = require("./models");
  db.sequelize.sync({ alter: process.env.NODE_ENV !== 'production' })
    .then(() => {
      console.log("Database synced successfully.");
    })
    .catch((err) => {
      console.log("Failed to sync database: " + err.message);
    });
});

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Vardaan Licensing System API." });
});

// Import routes
require("./routes/product.routes")(app);
require("./routes/productVersion.routes")(app);
require("./routes/customer.routes")(app);
require("./routes/license.routes")(app);
require("./routes/auth.routes")(app);

// API route for checking database connection
app.get("/api/check-connection", async (req, res) => {
  try {
    const db = require("./models");
    await db.sequelize.authenticate();
    res.json({ success: true, message: "Database connection successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database connection failed", error: error.message });
  }
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    message: "Not Found - The requested resource does not exist."
  });
});

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
