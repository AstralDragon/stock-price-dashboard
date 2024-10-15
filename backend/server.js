const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Body parser to parse JSON request bodies

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Signup route
app.post("/api/signup", async (req, res) => {
  const { username, password, role = "user" } = req.body;

  try {
    if (!username || !password)
      return res.status(400).send("Username and password required");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();
    res.status(201).send("User created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating user");
  }
});

// Sign-in route
app.post("/api/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password)
      return res.status(400).send("Username and password required");

    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    // Create and assign a token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    res.json({ token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error signing in");
  }
});

// Finnhub API setup
const API_URL = "https://finnhub.io/api/v1/quote";

// Endpoint to get stock price
app.get("/api/stocks", async (req, res) => {
  const symbols = req.query.symbols.split(",");
  const prices = {};

  try {
    await Promise.all(
      symbols.map(async (symbol) => {
        const response = await axios.get(`${API_URL}`, {
          params: {
            symbol: symbol,
            token: process.env.FINNHUB_API_KEY,
          },
        });

        // Finnhub's response contains current price in 'c'
        if (response.data && response.data.c) {
          prices[symbol] = response.data.c;
        } else {
          console.error(`Stock data for ${symbol} is unavailable`);
          prices[symbol] = "Data not available";
        }
      })
    );

    res.json(prices);
  } catch (error) {
    console.error("Error fetching stock prices:", error);
    res.status(500).send("Error fetching stock prices");
  }
});

// Endpoint to get historical prices
app.get("/api/historical/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  try {
    const response = await axios.get(API_URL, {
      params: {
        function: "TIME_SERIES_DAILY",
        symbol: symbol,
        apikey: process.env.FINNHUB_API_KEY,
      },
    });
    const timeSeries = response.data["Time Series (Daily)"];
    const historicalData = Object.keys(timeSeries).map((date) => ({
      date,
      price: timeSeries[date]["4. close"],
    }));
    res.json(historicalData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching historical prices");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
