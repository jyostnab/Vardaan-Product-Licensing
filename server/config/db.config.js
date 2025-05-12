
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "root_123",
  DB: process.env.DB_NAME || "vardaan_licensing",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false // Disable logging by default for cleaner output
};
