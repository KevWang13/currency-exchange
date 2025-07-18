// File: app.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// GET /api/exchange-rate
app.get('/api/exchange-rate', async (req, res) => {
  try {
    let dateStr;
    if (req.query.time) {
      const time = new Date(req.query.time);
      if (isNaN(time)) return res.status(400).json({ error: 'Invalid time format' });
      dateStr = time.toISOString().substring(0, 10);
    } else {
      const [latestRows] = await pool.query('SELECT MAX(Date) AS maxDate FROM Currency');
      if (!latestRows[0] || !latestRows[0].maxDate) {
        return res.status(404).json({ error: 'No data available' });
      }
      dateStr = latestRows[0].maxDate.toISOString().substring(0, 10);
    }

    const [rows] = await pool.query(
      'SELECT id, exchange_rate FROM Currency WHERE Date = ?',
      [dateStr]
    );

    const rates = {};
    rows.forEach(row => {
      rates[row.id] = Number(row.exchange_rate);
    });

    res.json({ date: dateStr, rates });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Scheduled task: fetch exchange rates daily at 05:00
cron.schedule('0 5 * * *', async () => {
  console.log('Running daily exchange rate fetch task...');
  try {
    const response = await axios.get(process.env.EXCHANGE_API_URL);
    const rates = response.data.rates;
    const today = new Date().toISOString().substring(0, 10);

    for (const [code, rate] of Object.entries(rates)) {
      const [existing] = await pool.query(
        'SELECT id FROM Currency WHERE Code = ? AND Date = ?',
        [code, today]
      );

      if (existing.length > 0) {
        await pool.query(
          'UPDATE Currency SET exchange_rate = ? WHERE Code = ? AND Date = ?',
          [rate, code, today]
        );
      } else {
        await pool.query(
          'INSERT INTO Currency (Code, Currency_name, exchange_rate, Date) VALUES (?, ?, ?, ?)',
          [code, code, rate, today]
        );
      }
    }

    console.log('Exchange rates updated successfully.');
  } catch (err) {
    console.error('Failed to fetch exchange rates:', err);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
