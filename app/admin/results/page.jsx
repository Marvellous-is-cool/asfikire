"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../../components/AdminLayout";
import {
  FaDownload,
  FaPrint,
  FaShareAlt,
  FaFilter,
  FaTrophy,
  FaUsers,
  FaDollarSign,
  FaChartBar,
  FaExclamationCircle,
  FaRedoAlt,
  FaTable,
  FaChartPie,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import { getVoteStatistics } from "../../../lib/votes";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import { useSettings } from "../../../contexts/SettingsContext";

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState("summary");
  const [colorFilter, setColorFilter] = useState("all");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("");
  const [filterActive, setFilterActive] = useState(false);
  const [userStats, setUserStats] = useState([]);
  const chartRef = useRef(null);
  const [error, setError] = useState(null);
  const { settings } = useSettings();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get overall statistics
      const data = await getVoteStatistics({ includeDetails: true });
      setStats(data);

      // Generate user statistics
      generateUserStats(data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError("Failed to load voting statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate user statistics from vote data
  const generateUserStats = (data) => {
    if (!data || !data.votes) return;

    // Create a map to store username data
    const userMap = new Map();

    // Process all votes and aggregate by username
    data.votes.forEach((vote) => {
      const username = vote.username || vote.memberEmail || "anonymous";
      const amount = Number(vote.voteAmount) || 0;
      const voteCount = vote.calculatedVotes || 1;
      const color = vote.color || "unknown";
      const family = vote.family || "unknown";

      // Initialize user data if not already in map
      if (!userMap.has(username)) {
        userMap.set(username, {
          username,
          totalVotes: 0,
          totalAmount: 0,
          colors: {},
          family: family,
          transactions: [],
        });
      }

      // Update user data
      const userData = userMap.get(username);
      userData.totalVotes += voteCount;
      userData.totalAmount += amount;

      // Update color breakdown
      if (!userData.colors[color]) {
        userData.colors[color] = { votes: 0, amount: 0 };
      }
      userData.colors[color].votes += voteCount;
      userData.colors[color].amount += amount;

      // Save transaction info
      userData.transactions.push({
        id: vote.id,
        reference: vote.reference,
        amount: amount,
        votes: voteCount,
        color: color,
        timestamp: vote.timestamp,
      });
    });

    // Convert map to array and sort by total votes
    const userArray = Array.from(userMap.values()).sort(
      (a, b) => b.totalVotes - a.totalVotes
    );
    setUserStats(userArray);
  };

  // Get only the enabled colors
  const enabledColorIds = settings.voting.shirtOptions
    .filter((color) => color.enabled)
    .map((color) => color.id);

  // Modified color data generator to only include enabled colors and properly calculate votes
  const generateColorData = () => {
    if (!stats || !stats.colorVotes) return [];

    return Object.entries(stats.colorVotes)
      .filter(([colorId]) => enabledColorIds.includes(colorId))
      .map(([color, data]) => {
        // Get color hex from settings
        const colorInfo = settings.voting.shirtOptions.find(
          (c) => c.id === color
        );

        // Calculate actual votes based on the price per vote
        const calculatedVotes = Math.floor(
          data.amount / settings.voting.pricePerVote
        );

        return {
          name: color.charAt(0).toUpperCase() + color.slice(1),
          value: calculatedVotes, // Use calculated votes instead of direct votes count
          rawVotes: data.votes || 0, // Keep the raw votes for reference
          amount: data.amount || 0,
          color: colorInfo
            ? colorInfo.hex
            : color === "wine"
            ? "#722F37"
            : color === "white"
            ? "#FFFFFF"
            : "#000000", // Changed from green to black
        };
      });
  };

  // Modified winner calculation to use the correct vote count
  const calculateWinner = () => {
    if (!stats || !stats.colorVotes) return null;

    let winner = null;
    let maxVotes = 0;

    Object.entries(stats.colorVotes).forEach(([color, data]) => {
      // Calculate votes from amount
      const calculatedVotes = Math.floor(
        data.amount / settings.voting.pricePerVote
      );

      // Only include enabled colors
      if (enabledColorIds.includes(color) && calculatedVotes > maxVotes) {
        maxVotes = calculatedVotes;
        winner = {
          color,
          votes: calculatedVotes,
          amount: data.amount,
          percentage: 0, // Will calculate below
        };
      }
    });

    if (winner) {
      // Calculate total from enabled colors only using the same calculation
      const totalVotes = Object.entries(stats.colorVotes)
        .filter(([colorId]) => enabledColorIds.includes(colorId))
        .reduce((sum, [_, data]) => {
          return sum + Math.floor(data.amount / settings.voting.pricePerVote);
        }, 0);

      winner.percentage =
        totalVotes > 0 ? (winner.votes / totalVotes) * 100 : 0;
    }

    return winner;
  };

  const generateFamilyData = () => {
    if (!stats || !stats.familyVotes) return [];

    return Object.entries(stats.familyVotes).map(([family, data]) => ({
      name: family.charAt(0).toUpperCase() + family.slice(1),
      votes: data.votes || 0,
      amount: data.amount || 0,
    }));
  };

  const exportChart = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      const imageData = canvas.toDataURL("image/png");

      // Create a download link
      const link = document.createElement("a");
      link.href = imageData;
      link.download = `anglican-voting-results-${
        new Date().toISOString().split("T")[0]
      }.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting chart:", error);
      alert("Failed to export chart. Please try again.");
    }
  };

  const shareResults = () => {
    // Create a shareable link or text
    const winnerInfo = calculateWinner();
    const shareText = winnerInfo
      ? `Anglican Student Fellowship Voting Results: ${
          winnerInfo.color
        } is currently leading with ${
          winnerInfo.votes
        } votes (${winnerInfo.percentage.toFixed(1)}%)!`
      : "Check out the Anglican Student Fellowship Voting Results!";

    if (navigator.share) {
      navigator
        .share({
          title: "Anglican Voting Results",
          text: shareText,
          // url: window.location.href,
        })
        .catch((err) => {
          console.error("Share failed:", err);
        });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard
        .writeText(shareText)
        .then(() => alert("Results summary copied to clipboard!"))
        .catch((err) => console.error("Failed to copy:", err));
    }
  };

  const printResults = () => {
    window.print();
  };

  // Update the calculation for total votes to use the amount and price per vote
  const totalVotes = stats
    ? Object.values(stats.colorVotes || {}).reduce(
        (sum, data) =>
          sum + Math.floor(data.amount / settings.voting.pricePerVote),
        0
      )
    : 0;

  const totalAmount = stats?.totalAmount || 0;
  const totalVoters = stats?.uniqueVoters || 0;
  const winner = calculateWinner();
  const colorData = generateColorData();
  const familyData = generateFamilyData();

  // Function to toggle filters
  const toggleFilters = () => {
    setFilterActive(!filterActive);
  };

  // Filter user stats by search term
  const filteredUserStats = userFilter
    ? userStats.filter((user) =>
        user.username.toLowerCase().includes(userFilter.toLowerCase())
      )
    : userStats;

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Voting Results</h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportChart}
              className="btn-outline flex items-center text-sm"
              disabled={loading}
            >
              <FaDownload className="mr-2" />
              Export Chart
            </button>

            <button
              onClick={printResults}
              className="btn-outline flex items-center text-sm print:hidden"
            >
              <FaPrint className="mr-2" />
              Print
            </button>

            <button
              onClick={shareResults}
              className="btn-outline flex items-center text-sm"
              disabled={loading}
            >
              <FaShareAlt className="mr-2" />
              Share
            </button>

            <button
              onClick={fetchStats}
              className="btn-outline flex items-center text-sm"
              disabled={loading}
            >
              <FaRedoAlt className="mr-2" />
              Refresh
            </button>

            <button
              onClick={toggleFilters}
              className="btn-outline flex items-center text-sm"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
          </div>
        </div>

        {filterActive && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username Filter
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    placeholder="Filter by username..."
                    className="w-full p-2 pl-8 border rounded-md"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Color
                </label>
                <select
                  value={colorFilter}
                  onChange={(e) => setColorFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Colors</option>
                  {settings.voting.shirtOptions
                    .filter((color) => color.enabled)
                    .map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Family
                </label>
                <select
                  value={familyFilter}
                  onChange={(e) => setFamilyFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Families</option>
                  {Object.keys(stats?.familyVotes || {}).map((family) => (
                    <option key={family} value={family}>
                      {family}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`px-4 py-2 flex items-center border-b-2 ${
              viewMode === "summary"
                ? "border-primary-500 text-primary-700 font-medium"
                : "border-transparent text-gray-500 hover:text-primary-600"
            }`}
            onClick={() => setViewMode("summary")}
          >
            <FaChartBar className="mr-2" />
            Summary
          </button>
          <button
            className={`px-4 py-2 flex items-center border-b-2 ${
              viewMode === "colors"
                ? "border-primary-500 text-primary-700 font-medium"
                : "border-transparent text-gray-500 hover:text-primary-600"
            }`}
            onClick={() => setViewMode("colors")}
          >
            <FaChartPie className="mr-2" />
            By Color
          </button>
          <button
            className={`px-4 py-2 flex items-center border-b-2 ${
              viewMode === "families"
                ? "border-primary-500 text-primary-700 font-medium"
                : "border-transparent text-gray-500 hover:text-primary-600"
            }`}
            onClick={() => setViewMode("families")}
          >
            <FaUsers className="mr-2" />
            By Family
          </button>
          <button
            className={`px-4 py-2 flex items-center border-b-2 ${
              viewMode === "users"
                ? "border-primary-500 text-primary-700 font-medium"
                : "border-transparent text-gray-500 hover:text-primary-600"
            }`}
            onClick={() => setViewMode("users")}
          >
            <FaUser className="mr-2" />
            By User
          </button>
          <button
            className={`px-4 py-2 flex items-center border-b-2 ${
              viewMode === "table"
                ? "border-primary-500 text-primary-700 font-medium"
                : "border-transparent text-gray-500 hover:text-primary-600"
            }`}
            onClick={() => setViewMode("table")}
          >
            <FaTable className="mr-2" />
            Table View
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Loading voting data...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FaExclamationCircle className="text-red-500 text-4xl mb-3" />
            <p className="text-gray-700 mb-4">{error}</p>
            <button className="btn-primary" onClick={fetchStats}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Summary View */}
            {viewMode === "summary" && (
              <div ref={chartRef}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Total Votes Card */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-start">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FaChartBar className="text-blue-700 text-xl" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm text-blue-700 font-medium">
                          Total Votes
                        </h3>
                        <p className="text-2xl font-bold">
                          {totalVotes.toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600">
                          {totalVoters} unique voters
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total Amount Card */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-start">
                      <div className="p-3 bg-green-100 rounded-full">
                        <FaDollarSign className="text-green-700 text-xl" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm text-green-700 font-medium">
                          Total Amount
                        </h3>
                        <p className="text-2xl font-bold">
                          ₦{totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600">
                          ₦{settings.voting.pricePerVote} per vote
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Winner Card */}
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <div className="flex items-start">
                      <div className="p-3 bg-amber-100 rounded-full">
                        <FaTrophy className="text-amber-700 text-xl" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm text-amber-700 font-medium">
                          Current Leader
                        </h3>
                        {winner ? (
                          <>
                            <p className="text-2xl font-bold capitalize">
                              {winner.color}
                            </p>
                            <p className="text-xs text-amber-600">
                              {winner.votes} votes (
                              {winner.percentage.toFixed(1)}%)
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-700">No votes yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Chart */}
                <div className="mt-6">
                  <h2 className="text-lg font-medium mb-4">
                    Vote Distribution by Color
                  </h2>
                  <div className="h-80 w-full">
                    {colorData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={colorData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(1)}%`
                            }
                          >
                            {colorData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.color === "#FFFFFF"
                                    ? "#e0e0e0"
                                    : entry.color
                                }
                                stroke="#fff"
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [
                              `${value} votes`,
                              name,
                            ]}
                            contentStyle={{
                              background: "rgba(255, 255, 255, 0.9)",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <p>No voting data to display</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Colors View */}
            {viewMode === "colors" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-4">Color Votes</h2>

                  <div className="h-80 w-full">
                    {colorData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={colorData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name, props) => {
                              if (name === "value")
                                return [`${value} votes`, "Votes"];
                              if (name === "amount")
                                return [`₦${value.toFixed(2)}`, "Amount"];
                              return [value, name];
                            }}
                          />
                          <Legend />
                          <Bar dataKey="value" name="Votes" fill="#4338ca">
                            {colorData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.color === "#FFFFFF"
                                    ? "#e0e0e0"
                                    : entry.color
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <p>No color voting data to display</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  {colorData.map((color) => (
                    <div key={color.name} className="border rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div
                          className="w-6 h-6 rounded-full mr-2 border border-gray-300"
                          style={{ backgroundColor: color.color }}
                        ></div>
                        <h3 className="font-medium">{color.name}</h3>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Votes:</span>
                          <span className="font-medium">{color.value}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Amount:</span>
                          <span className="font-medium">
                            ₦{color.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">
                            Percentage:
                          </span>
                          <span className="font-medium">
                            {totalVotes > 0
                              ? ((color.value / totalVotes) * 100).toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full"
                            style={{
                              width: `${
                                totalVotes > 0
                                  ? (color.value / totalVotes) * 100
                                  : 0
                              }%`,
                              backgroundColor:
                                color.color === "#FFFFFF"
                                  ? "#e0e0e0"
                                  : color.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Families View */}
            {viewMode === "families" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-4">Family Votes</h2>

                  <div className="h-80 w-full">
                    {familyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={familyData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name, props) => {
                              if (name === "votes")
                                return [`${value} votes`, "Votes"];
                              if (name === "amount")
                                return [`₦${value.toFixed(2)}`, "Amount"];
                              return [value, name];
                            }}
                          />
                          <Legend />
                          <Bar dataKey="votes" fill="#4c1d95" name="Votes" />
                          <Bar
                            dataKey="amount"
                            fill="#047857"
                            name="Amount (₦)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <p>No family voting data to display</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">
                    Family Vote Distribution
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Family
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Votes
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            % of Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {familyData.map((family) => (
                          <tr key={family.name} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium">
                              {family.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {family.votes.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              ₦{family.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {totalVotes > 0
                                ? ((family.votes / totalVotes) * 100).toFixed(1)
                                : 0}
                              %
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Users View - New Section */}
            {viewMode === "users" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-4">
                    Voting by Username
                  </h2>

                  {filteredUserStats.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Username
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Family
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Total Votes
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Total Amount
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Color Breakdown
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredUserStats.map((user, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-medium">
                                {user.username}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {user.family}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {user.totalVotes}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                ₦{user.totalAmount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(user.colors).map(
                                    ([color, data]) => (
                                      <span
                                        key={color}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        style={{
                                          backgroundColor:
                                            color === "white"
                                              ? "#e5e5e5"
                                              : color === "wine"
                                              ? "#F8E7E9"
                                              : color === "black"
                                              ? "#E0E0E0"
                                              : "#f3f4f6",
                                          color:
                                            color === "white"
                                              ? "#374151"
                                              : color === "wine"
                                              ? "#731C31"
                                              : color === "black"
                                              ? "#111827"
                                              : "#374151",
                                        }}
                                      >
                                        {color}: {data.votes}
                                      </span>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <p>No user voting data to display</p>
                    </div>
                  )}
                </div>

                {/* User Details Section */}
                {filteredUserStats.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Top Voters</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {filteredUserStats.slice(0, 6).map((user, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <div className="bg-primary-100 p-2 rounded-full mr-3">
                              <FaUser className="text-primary-600" />
                            </div>
                            <div>
                              <h4 className="font-bold">{user.username}</h4>
                              <p className="text-sm text-gray-500">
                                {user.family}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Total Votes:
                              </span>
                              <span className="font-medium">
                                {user.totalVotes}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Total Amount:
                              </span>
                              <span className="font-medium">
                                ₦{user.totalAmount.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">
                                Color Breakdown:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(user.colors).map(
                                  ([color, data]) => (
                                    <span
                                      key={color}
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                      style={{
                                        backgroundColor:
                                          color === "white"
                                            ? "#e5e5e5"
                                            : color === "wine"
                                            ? "#F8E7E9"
                                            : color === "black"
                                            ? "#E0E0E0"
                                            : "#f3f4f6",
                                        color:
                                          color === "white"
                                            ? "#374151"
                                            : color === "wine"
                                            ? "#731C31"
                                            : color === "black"
                                            ? "#111827"
                                            : "#374151",
                                      }}
                                    >
                                      {color}: {data.votes}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-2">
                    Voting Data Table
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Complete voting statistics in tabular format (calculated at
                    ₦{settings.voting.pricePerVote} per vote)
                  </p>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Category
                          </th>
                          {/* Only show enabled colors */}
                          {settings.voting.shirtOptions
                            .filter((color) => color.enabled)
                            .map((color) => (
                              <th
                                key={color.id}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {color.name}
                              </th>
                            ))}
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            Vote Count
                          </td>
                          {settings.voting.shirtOptions
                            .filter((color) => color.enabled)
                            .map((color) => {
                              const colorStats =
                                stats?.colorVotes?.[color.id] || {};
                              const calculatedVotes = Math.floor(
                                (colorStats.amount || 0) /
                                  settings.voting.pricePerVote
                              );

                              return (
                                <td
                                  key={color.id}
                                  className="px-6 py-4 whitespace-nowrap"
                                >
                                  {calculatedVotes}
                                </td>
                              );
                            })}
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {totalVotes}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            Amount (₦)
                          </td>
                          {settings.voting.shirtOptions
                            .filter((color) => color.enabled)
                            .map((color) => (
                              <td
                                key={color.id}
                                className="px-6 py-4 whitespace-nowrap"
                              >
                                ₦
                                {(
                                  stats?.colorVotes?.[color.id]?.amount || 0
                                ).toLocaleString()}
                              </td>
                            ))}
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            ₦{totalAmount.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            Percentage
                          </td>
                          {settings.voting.shirtOptions
                            .filter((color) => color.enabled)
                            .map((color) => {
                              const colorStats =
                                stats?.colorVotes?.[color.id] || {};
                              const calculatedVotes = Math.floor(
                                (colorStats.amount || 0) /
                                  settings.voting.pricePerVote
                              );
                              const percentage =
                                totalVotes > 0
                                  ? (calculatedVotes / totalVotes) * 100
                                  : 0;
                              return (
                                <td
                                  key={color.id}
                                  className="px-6 py-4 whitespace-nowrap"
                                >
                                  {percentage.toFixed(1)}%
                                </td>
                              );
                            })}
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            100%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Family Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Family
                          </th>
                          {settings.voting.shirtOptions
                            .filter((color) => color.enabled)
                            .map((color) => (
                              <th
                                key={color.id}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {color.name}
                              </th>
                            ))}
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.keys(stats?.familyVotes || {}).map((family) => (
                          <tr key={family} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium">
                              {family.charAt(0).toUpperCase() + family.slice(1)}
                            </td>

                            {settings.voting.shirtOptions
                              .filter((color) => color.enabled)
                              .map((color) => {
                                const votes =
                                  stats?.familyColorVotes?.[family]?.[
                                    color.id
                                  ] || 0;
                                return (
                                  <td
                                    key={color.id}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    {votes}
                                  </td>
                                );
                              })}

                            <td className="px-6 py-4 whitespace-nowrap font-medium">
                              {stats?.familyVotes?.[family]?.votes || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
