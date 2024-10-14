import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

function App() {
  const [symbols, setSymbols] = useState("AAPL,GOOGL");
  const [prices, setPrices] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const fetchStockPrices = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/stocks?symbols=${symbols}`
      );
      setPrices(response.data);
      setError("");
      fetchHistoricalData(selectedSymbol); // Fetch historical data for the selected symbol
    } catch (err) {
      setError("Error fetching stock prices");
      setPrices({});
    }
  };

  const fetchHistoricalData = async (symbol) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/historical/${symbol}`
      );
      setHistoricalData(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await axios.post("http://localhost:5000/api/signup", {
          username,
          password,
        });
        alert("Signup successful! Please sign in.");
        setIsSignup(false); // Switch to sign-in after signup
      } else {
        const response = await axios.post("http://localhost:5000/api/signin", {
          username,
          password,
        });
        setIsLoggedIn(true);
        setSelectedSymbol(symbols.split(",")[0]); // Set the selected symbol to the first one in the list
        fetchHistoricalData(symbols.split(",")[0]); // Fetch historical data on login
      }
    } catch (error) {
      console.error(error);
      alert("Error during authentication");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchStockPrices();
    }
  }, [symbols, isLoggedIn]);

  const chartData = {
    labels: historicalData
      .map((data) => data.date)
      .slice(0, 30)
      .reverse(),
    datasets: [
      {
        label: `${selectedSymbol} Historical Price`,
        data: historicalData
          .map((data) => parseFloat(data.price)) // Ensure prices are numbers
          .slice(0, 30)
          .reverse(),
        fill: false,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };

  return (
    <div className="App">
      <h1>Real-Time Stock Price Dashboard</h1>
      {!isLoggedIn ? (
        <div>
          {isSignup ? (
            <form onSubmit={handleAuthSubmit}>
              <h2>Sign Up</h2>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">Sign Up</button>
              <p onClick={() => setIsSignup(false)}>
                Already have an account? Sign In
              </p>
            </form>
          ) : (
            <form onSubmit={handleAuthSubmit}>
              <h2>Sign In</h2>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">Sign In</button>
              <p onClick={() => setIsSignup(true)}>
                Don't have an account? Sign Up
              </p>
            </form>
          )}
        </div>
      ) : (
        <div>
          <h2>Welcome, {username}!</h2>
          <button onClick={handleLogout}>Logout</button>
          <div>
            <label>
              Stock Symbols (comma-separated):
              <input
                type="text"
                value={symbols}
                onChange={(e) => setSymbols(e.target.value)}
              />
            </label>
            <button onClick={fetchStockPrices}>Get Prices</button>
          </div>
          {error && <p>{error}</p>}
          {Object.keys(prices).length > 0 && (
            <div>
              {Object.entries(prices).map(([symbol, price]) => (
                <h2 key={symbol}>
                  {symbol} Price: ${price}
                </h2>
              ))}
            </div>
          )}
          {historicalData.length > 0 && <Line data={chartData} />}
        </div>
      )}
    </div>
  );
}

export default App;
