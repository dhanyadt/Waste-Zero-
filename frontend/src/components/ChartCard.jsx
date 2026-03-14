import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Weekly data - showing recycling data for each week of the current month
const weeklyData = [
  { period: "Week 1", recycled: 45 },
  { period: "Week 2", recycled: 62 },
  { period: "Week 3", recycled: 78 },
  { period: "Week 4", recycled: 55 },
];

// Monthly data - showing recycling data for each month
const monthlyData = [
  { period: "Jan", recycled: 120 },
  { period: "Feb", recycled: 200 },
  { period: "Mar", recycled: 150 },
  { period: "Apr", recycled: 300 },
  { period: "May", recycled: 250 },
  { period: "Jun", recycled: 280 },
  { period: "Jul", recycled: 320 },
  { period: "Aug", recycled: 290 },
  { period: "Sep", recycled: 350 },
  { period: "Oct", recycled: 310 },
  { period: "Nov", recycled: 280 },
  { period: "Dec", recycled: 380 },
];

// Yearly data - showing recycling data for each year
const yearlyData = [
  { period: "2022", recycled: 1250 },
  { period: "2023", recycled: 2100 },
  { period: "2024", recycled: 2850 },
  { period: "2025", recycled: 3400 },
];

const ChartCard = () => {
  const [timePeriod, setTimePeriod] = useState("monthly");

  // Get the appropriate data and title based on selected time period
  const getChartData = () => {
    switch (timePeriod) {
      case "weekly":
        return { data: weeklyData, title: "Weekly Recycling Trend (kg)" };
      case "monthly":
        return { data: monthlyData, title: "Monthly Recycling Trend (kg)" };
      case "yearly":
        return { data: yearlyData, title: "Yearly Recycling Trend (kg)" };
      default:
        return { data: monthlyData, title: "Monthly Recycling Trend (kg)" };
    }
  };

  const { data, title } = getChartData();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md h-80">
      {/* Header with time period selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">{title}</h3>
        
        {/* Time period selector buttons */}
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => setTimePeriod("weekly")}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              timePeriod === "weekly"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimePeriod("monthly")}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              timePeriod === "monthly"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimePeriod("yearly")}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              timePeriod === "yearly"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />

          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            labelStyle={{ color: "#374151" }}
          />

          <Line
            type="monotone"
            dataKey="recycled"
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ r: 5, fill: "#16a34a" }}
            activeDot={{ r: 7, fill: "#16a34a" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCard;
