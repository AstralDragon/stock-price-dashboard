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
    <div className="flex flex-col items-center gap-4">
      <div className="h-[70dvh] w-[60dvw] box-border grid grid-cols-[auto_auto_auto] grid-rows-1 rounded-[20px] mt-10 gap-10 items-center justify-center bg-gradient-to-br from-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0)] backdrop-blur border border-[rgba(255,255,255,0.18)] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div>
          <h1 className="text-5xl flex flex-col text-white">
            Real-Time Stock Price Dashboard
          </h1>
        </div>
        <span className="bg-[rgba(200,200,200,0.28)] w-[0.1rem] h-[80%] self-center rounded-full"></span>
        {!isLoggedIn ? (
          <div className="">
            {isSignup ? (
              <form
                className="flex flex-col items-center gap-7"
                onSubmit={handleAuthSubmit}
              >
                <h2 className="text-3xl text-white">Sign Up</h2>
                <input
                  className="w-[100%] h-10 rounded-md px-2"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  className="w-[100%] h-10 rounded-md px-2"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-red-400 w-[60%] h-10 rounded-md hover:border hover:text-white"
                >
                  Sign Up
                </button>
                <p className="text-white" onClick={() => setIsSignup(false)}>
                  Already have an account?{" "}
                  <span className="hover:cursor-pointer hover:underline text-blue-500">
                    Sign Up
                  </span>
                </p>
              </form>
            ) : (
              <form
                onSubmit={handleAuthSubmit}
                className="flex flex-col items-center gap-7"
              >
                <h2 className="text-3xl text-white">Sign In</h2>
                <input
                  className="w-[100%] h-10 rounded-md px-2"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  className="w-[100%] h-10 rounded-md px-2"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-red-400 w-[60%] h-10 rounded-md hover:border hover:text-white"
                >
                  Sign In
                </button>
                <p className="text-white" onClick={() => setIsSignup(true)}>
                  Don't have an account?{" "}
                  <span className="hover:cursor-pointer hover:underline text-blue-500">
                    Sign Up
                  </span>
                </p>
              </form>
            )}
          </div>
        ) : (
          <div className="text-white">
            <h2 className="text-3xl mb-3">Welcome, {username} 👋🏻</h2>
            <div className="flex flex-col">
              <label htmlFor="stockName">
                Enter Stock Symbols (comma-separated):
              </label>
              <input
                className="text-black w-[100%] h-10 rounded-md px-2 mb-5"
                id="stockName"
                type="text"
                value={symbols}
                onChange={(e) => setSymbols(e.target.value)}
              />
              <button
                className="w-24 h-10 rounded-md bg-white hover:border-2 hover:border-green-600 text-black mb-5"
                onClick={fetchStockPrices}
              >
                Get Prices
              </button>
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
            <button
              className="bg-red-600 mt-5 font-semibold w-24 h-10 rounded-md hover:text-red-600 hover:bg-black"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <footer className="text-white">
        Created by{" "}
        <a
          target="_blank"
          href="https://www.linkedin.com/in/vinitml/"
          className="hover:underline"
          rel="noreferrer"
        >
          Vinit Mittal
        </a>
        👍
      </footer>
    </div>
  );
}

export default App;
