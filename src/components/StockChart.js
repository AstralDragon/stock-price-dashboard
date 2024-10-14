// StockChart.js
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get(`/api/historical/${symbol}`);
        const dates = response.data.map((data) => data.date);
        const prices = response.data.map((data) => parseFloat(data.price)); // Ensure prices are numbers

        setChartData({
          labels: dates,
          datasets: [
            {
              label: `${symbol} Stock Price`,
              data: prices,
              backgroundColor: "rgba(75,192,192,0.2)",
              borderColor: "rgba(75,192,192,1)",
              borderWidth: 1,
              fill: false,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    };

    fetchHistoricalData();
  }, [symbol]);

  return (
    <div>
      <h2>{symbol} Stock Price Chart</h2>
      <Line data={chartData} />
    </div>
  );
};

export default StockChart;
