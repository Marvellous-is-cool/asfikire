"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminLoginForm from "../../components/AdminLoginForm";
import AdminLayout from "../../components/AdminLayout";
import { isAdminAuthenticated } from "../../lib/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import {
  FaUsers,
  FaMoneyBill,
  FaTshirt,
  FaChartLine,
  FaExclamationTriangle,
  FaSync,
} from "react-icons/fa";

// Add a section for failed votes
const FailedVotesSection = ({ failedVotes, onProcessVote }) => {
  if (failedVotes.length === 0) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-red-800">
          Votes Requiring Manual Processing ({failedVotes.length})
        </h3>
        <button
          className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
          onClick={() => onProcessVote("all")}
        >
          Process All
        </button>
      </div>

      <div className="space-y-3 mt-4">
        {failedVotes.map((vote) => (
          <div
            key={vote.id}
            className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor:
                      vote.color === "wine"
                        ? "#722F37"
                        : vote.color === "black"
                        ? "#000000"
                        : "#FFFFFF",
                    border: vote.color === "white" ? "1px solid #ddd" : "none",
                  }}
                ></div>
                <span className="font-medium capitalize">{vote.color}</span>
                <span className="text-sm text-gray-500">
                  ({vote.voteCount} votes)
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Amount: ₦{vote.amount.toFixed(2)} | Ref:{" "}
                {vote.reference.substring(0, 8)}...
              </div>
              <div className="text-xs text-gray-500">
                {new Date(vote.timestamp).toLocaleString()}
              </div>
            </div>
            <button
              className="bg-primary-100 hover:bg-primary-200 text-primary-800 px-3 py-1 rounded text-sm"
              onClick={() => onProcessVote(vote.id)}
            >
              Process Vote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVotes: 0,
    totalAmount: 0,
    colorDistribution: [],
    recentActivity: [],
  });
  const [failedVotes, setFailedVotes] = useState([]);
  const router = useRouter();

  // Check authentication state on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAdminAuthenticated();
      setIsLoggedIn(authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Data fetching function with robust error handling
  const fetchDashboardStats = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      // Get users count with error handling
      let usersCount = 0;
      try {
        const usersSnapshot = await getDocs(collection(db, "members"));
        usersCount = usersSnapshot.size;
      } catch (error) {
        console.error("Error fetching users:", error);
        // Continue with other data fetching despite this error
      }

      // Get votes data with error handling
      let votes = [];
      try {
        const votesSnapshot = await getDocs(
          query(collection(db, "votes"), orderBy("timestamp", "desc"))
        );
        votes = votesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));
      } catch (error) {
        console.error("Error fetching votes:", error);
        // Continue with other data fetching despite this error
      }

      // Calculate total amount with default handling
      const totalAmount = votes.reduce((sum, vote) => {
        const amount = vote.voteAmount || 0;
        // Make sure we're dealing with valid numbers
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      // Calculate color distribution
      const colorCounts = {};
      votes.forEach((vote) => {
        const color = vote.color || "unknown";
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });

      const colorDistribution = Object.entries(colorCounts)
        .map(([color, count]) => ({
          color,
          count,
          percentage: votes.length
            ? ((count / votes.length) * 100).toFixed(1)
            : 0,
        }))
        .sort((a, b) => b.count - a.count);

      // Get recent activity (last 5 votes or payments)
      let recentActivity = [];
      try {
        // Recent votes
        const recentVotes = votes.slice(0, 5).map((vote) => ({
          type: "vote",
          color: vote.color || "unknown",
          amount: vote.voteAmount || 0,
          timestamp: vote.timestamp,
          user: vote.username || "Anonymous",
        }));

        // Recent payments
        const paymentsSnapshot = await getDocs(
          query(
            collection(db, "payments"),
            orderBy("timestamp", "desc"),
            limit(5)
          )
        );

        const recentPayments = paymentsSnapshot.docs.map((doc) => ({
          type: "payment",
          reference: doc.data().reference || "N/A",
          amount: doc.data().amount || 0,
          timestamp: doc.data().timestamp?.toDate() || new Date(),
          status: doc.data().status || "unknown",
        }));

        // Combine and sort by timestamp
        recentActivity = [...recentVotes, ...recentPayments]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        // Continue despite this error
      }

      // Update stats state
      setStats({
        totalUsers: usersCount,
        totalVotes: votes.length,
        totalAmount,
        colorDistribution,
        recentActivity,
      });

      // Update last refresh time
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setDashboardError(
        "Failed to load dashboard data. Please try refreshing."
      );
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // Fetch dashboard data on login
  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardStats();
    }
  }, [isLoggedIn, fetchDashboardStats]);

  // Add fetch for failed votes
  useEffect(() => {
    const fetchFailedVotes = async () => {
      try {
        const failedVotesQuery = query(
          collection(db, "failed_votes"),
          where("processed", "==", false),
          orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(failedVotesQuery);
        const votes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));

        setFailedVotes(votes);
      } catch (error) {
        console.error("Error fetching failed votes:", error);
      }
    };

    fetchFailedVotes();
  }, []);

  // Add function to process failed votes
  const handleProcessVote = async (voteId) => {
    try {
      if (voteId === "all") {
        // Process all failed votes
        for (const vote of failedVotes) {
          await processFailedVote(vote);
        }
        setFailedVotes([]);
      } else {
        // Process a single failed vote
        const vote = failedVotes.find((v) => v.id === voteId);
        if (vote) {
          await processFailedVote(vote);
          setFailedVotes(failedVotes.filter((v) => v.id !== voteId));
        }
      }
    } catch (error) {
      console.error("Error processing failed vote:", error);
      alert("Error processing vote: " + error.message);
    }
  };

  const processFailedVote = async (vote) => {
    try {
      // Submit the vote
      await submitVote(
        vote.color,
        vote.amount,
        vote.onBehalfOf,
        vote.voteCount,
        vote.reference
      );

      // Mark as processed
      await updateDoc(doc(db, "failed_votes", vote.id), {
        processed: true,
        processedAt: serverTimestamp(),
        processedBy: auth.currentUser?.email || "admin",
      });

      return true;
    } catch (error) {
      console.error("Error processing failed vote:", error);
      throw error;
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not logged in, show login form
  if (!isLoggedIn) {
    return <AdminLoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Admin dashboard view
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            {lastRefresh && (
              <span className="text-xs text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchDashboardStats}
              disabled={dashboardLoading}
              className="btn-outline text-sm py-1 px-3 flex items-center"
            >
              {dashboardLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <FaSync className="mr-2" />
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>

        {dashboardError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3" />
              <p className="text-red-700">{dashboardError}</p>
            </div>
          </div>
        )}

        {dashboardLoading && !stats.totalUsers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-md animate-pulse"
              >
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded-full w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaUsers className="text-blue-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">
                      Total Users
                    </h3>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaMoneyBill className="text-green-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">
                      Revenue
                    </h3>
                    <p className="text-2xl font-bold">
                      ₦{stats.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FaTshirt className="text-purple-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">
                      Total Votes
                    </h3>
                    <p className="text-2xl font-bold">{stats.totalVotes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <FaChartLine className="text-amber-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">
                      Leading Color
                    </h3>
                    <p className="text-2xl font-bold capitalize">
                      {stats.colorDistribution[0]?.color || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Failed Votes Section */}
            <FailedVotesSection
              failedVotes={failedVotes}
              onProcessVote={handleProcessVote}
            />

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Color Distribution */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-medium mb-4">
                  Color Vote Distribution
                </h2>
                <div className="space-y-4">
                  {stats.colorDistribution.map((item) => (
                    <div key={item.color} className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            item.color === "wine"
                              ? "#722F37"
                              : item.color === "white"
                              ? "#FFFFFF"
                              : item.color === "black"
                              ? "#000000"
                              : "#CCCCCC",
                          border:
                            item.color === "white"
                              ? "1px solid #DDDDDD"
                              : "none",
                        }}
                      ></div>
                      <span className="capitalize w-20">{item.color}</span>
                      <div className="flex-grow mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor:
                                item.color === "wine"
                                  ? "#722F37"
                                  : item.color === "white"
                                  ? "#DDDDDD"
                                  : item.color === "black"
                                  ? "##00000"
                                  : "#CCCCCC",
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {item.count} votes ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-medium mb-4">Recent Activity</h2>

                {stats.recentActivity.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No recent activity to display
                  </div>
                ) : (
                  <div className="divide-y">
                    {stats.recentActivity.map((activity, index) => (
                      <div key={index} className="py-3 flex justify-between">
                        <div>
                          {activity.type === "vote" ? (
                            <p className="text-sm font-medium">
                              Vote for{" "}
                              <span className="capitalize">
                                {activity.color}
                              </span>
                            </p>
                          ) : (
                            <p className="text-sm font-medium">
                              Payment: {activity.reference}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {activity.type === "vote"
                              ? activity.user
                              : activity.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ₦{activity.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
