const mysql = require('mysql2');
require('dotenv').config();  // To load environment variables from .env file

// Create a MySQL connection pool (use pooling for better performance)
const db = mysql.createPool({
  host: process.env.DB_HOST,  // Use the DB_HOST from .env
  user: process.env.DB_USER,  // Use the DB_USER from .env
  port: process.env.DB_PORT,
  password: process.env.DB_PASS,  // Use the DB_PASS from .env (with the password containing special characters)
  database: process.env.DB_NAME,  // Use the DB_NAME from .env
});

// Export the connection pool, and use Promise-based queries for async/await support
module.exports = db.promise();

  