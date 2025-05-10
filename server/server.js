
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

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

// Database connection and sync
const db = require("./models");
db.sequelize.sync({ alter: process.env.NODE_ENV !== 'production' })
  .then(() => {
    console.log("Database synced successfully.");
  })
  .catch((err) => {
    console.log("Failed to sync database: " + err.message);
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
