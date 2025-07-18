// index.js
const express = require("express");
const schedule = require("node-schedule");

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for toy data
let currencyData = [];

// Function to simulate fetching and storing currency data
const taskFetchCurrencyRate = () => {
    const timestamp = new Date();

    const currentRates = {
        GOLD: 0.01,
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.78,
        JPY: 158.34,
        CNY: 7.21,
        AUD: 1.49,
    };

    let rateChanges24hr = null;
    if (currencyData.length > 0) {
        const previous = currencyData[currencyData.length - 1];
        rateChanges24hr = {};
        for (let key in currentRates) {
            if (previous.rates[key] !== undefined) {
                rateChanges24hr[key] = currentRates[key] - previous.rates[key];
            }
        }
    }

    const record = {
        timestamp,
        base: "USD", // Note: Base currency is USD
        unit: "gram",
        rates: currentRates,
        rateChanges24hr // Note: 24-hour rate change data
    };

    currencyData.push(record);
    console.log("Stored toy currency data at:", timestamp);
};

// Schedule to run every minute for demo (change to daily if needed)
schedule.scheduleJob("*/1 * * * *", taskFetchCurrencyRate);

// API: Get all stored currency data
app.get("/rates", (req, res) => {
    res.json(currencyData);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Toy server running at http://localhost:${PORT}`);
});
