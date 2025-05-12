"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../../components/AdminLayout";
import {
  FaSearch,
  FaDownload,
  FaFileExcel,
  FaPrint,
  FaEye,
  FaRedoAlt,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTimes,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "timestamp",
    direction: "desc",
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [lastRefresh, setLastRefresh] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 50,
    totalItems: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, [pagination.currentPage]);

  const fetchPayments = async (fromStart = false) => {
    if (fromStart) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate date constraints if provided
      let startDate, endDate;
      if (dateRange.start && dateRange.end) {
        startDate = new Date(dateRange.start);
        endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // End of day
      }

      // Primary collection: payments (stores validated transactions)
      let paymentsQuery = query(
        collection(db, "payments"),
        orderBy("timestamp", "desc"),
        limit(pagination.pageSize)
      );

      // Apply date filters if provided
      if (startDate && endDate) {
        paymentsQuery = query(
          collection(db, "payments"),
          where("timestamp", ">=", startDate),
          where("timestamp", "<=", endDate),
          orderBy("timestamp", "desc"),
          limit(pagination.pageSize)
        );
      }

      // Execute primary query
      const paymentsSnapshot = await getDocs(paymentsQuery);

      // Process payments data
      const primaryPayments = paymentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        source: "payment",
        sourceLabel: "Payment Validation",
      }));

      // Secondary collection: payment_webhooks (stores webhook notifications)
      // Only include webhooks that don't have a corresponding payment record
      const webhooksQuery = query(
        collection(db, "payment_webhooks"),
        orderBy("timestamp", "desc"),
        limit(100) // Fetch more to match with payments
      );

      const webhooksSnapshot = await getDocs(webhooksQuery);

      // Process webhooks data
      const webhookPayments = webhooksSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          source: "webhook",
          sourceLabel: "Paystack Webhook",
        }))
        // Filter out webhooks that have a related payment (avoid duplicates)
        .filter((webhook) => {
          // Only include webhooks that don't match any payment reference
          return !primaryPayments.some(
            (payment) => payment.reference === webhook.reference
          );
        })
        // Limit to match pagination
        .slice(0, pagination.pageSize);

      // Combine and sort all payments
      const allPayments = [...primaryPayments, ...webhookPayments].sort(
        (a, b) => {
          // Handle Firebase timestamps or date strings
          const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
          const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
          return bTime - aTime;
        }
      );

      // Update pagination info
      setPagination((prev) => ({
        ...prev,
        totalItems:
          Math.max(primaryPayments.length, webhookPayments.length) * 2, // Estimate
      }));

      // Store combined results and update state
      setPayments(allPayments);
      setLastRefresh(new Date());
      setError(null);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError("Failed to load payment data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedPayments = [...payments].sort((a, b) => {
    // For timestamps, convert to Date objects
    if (sortConfig.key === "timestamp") {
      const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
      const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
      return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime;
    }

    // For amount and other numeric fields
    if (sortConfig.key === "amount") {
      return sortConfig.direction === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    }

    // For string comparisons
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Apply filters and search
  const filteredPayments = sortedPayments.filter((payment) => {
    // Filter by status
    if (filterStatus !== "all" && payment.status !== filterStatus) {
      return false;
    }

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      const paymentDate =
        payment.timestamp?.toDate?.() || new Date(payment.timestamp);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day

      if (paymentDate < startDate || paymentDate > endDate) {
        return false;
      }
    }

    // Search by reference or email
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const reference = payment.reference?.toLowerCase() || "";
      const email = payment.customer?.email?.toLowerCase() || "";
      const name = payment.customer?.name?.toLowerCase() || "";

      return (
        reference.includes(lowerSearch) ||
        email.includes(lowerSearch) ||
        name.includes(lowerSearch)
      );
    }

    return true;
  });

  const exportToExcel = () => {
    // Implement Excel export
    alert("Export to Excel feature would be implemented here");
  };

  const handlePrint = () => {
    window.print();
  };

  // Pagination controls
  const handleNextPage = () => {
    setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
  };

  const handlePrevPage = () => {
    setPagination((prev) => ({
      ...prev,
      currentPage: Math.max(1, prev.currentPage - 1),
    }));
  };

  // Format date from Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Enhanced payment display
  const formatPaymentDetails = (payment) => {
    // Extract additional details for enhanced display
    const details = [];

    if (payment.metadata?.color) {
      details.push({
        label: "Color Vote",
        value:
          payment.metadata.color.charAt(0).toUpperCase() +
          payment.metadata.color.slice(1),
      });
    }

    if (payment.metadata?.votes) {
      details.push({
        label: "Votes",
        value: payment.metadata.votes,
      });
    }

    if (payment.cardType) {
      details.push({
        label: "Card Type",
        value: payment.cardType,
      });
    }

    if (payment.bank) {
      details.push({
        label: "Bank",
        value: payment.bank,
      });
    }

    if (payment.lastFourDigits) {
      details.push({
        label: "Card Number",
        value: `**** **** **** ${payment.lastFourDigits}`,
      });
    }

    return details;
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">
            Payment Transactions
          </h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToExcel}
              className="btn-outline flex items-center text-sm"
            >
              <FaFileExcel className="mr-2" />
              Export Excel
            </button>

            <button
              onClick={handlePrint}
              className="btn-outline flex items-center text-sm print:hidden"
            >
              <FaPrint className="mr-2" />
              Print
            </button>

            <button
              onClick={() => fetchPayments(true)}
              className="btn-outline flex items-center text-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <FaRedoAlt className="mr-2" />
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Last refresh time */}
        {lastRefresh && (
          <div className="text-xs text-gray-500 mb-4">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <FaExclamationCircle className="text-red-500 mt-0.5 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference, email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center justify-center md:w-auto"
          >
            <FaFilter className="mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50 p-4 rounded-lg mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="all">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setFilterStatus("all");
                  setDateRange({ start: "", end: "" });
                }}
                className="btn-outline mr-2"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}

        {loading && payments.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("reference")}
                    >
                      <div className="flex items-center">
                        Reference
                        {sortConfig.key === "reference" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortAmountUp className="ml-1" size={12} />
                          ) : (
                            <FaSortAmountDown className="ml-1" size={12} />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("timestamp")}
                    >
                      <div className="flex items-center">
                        Date
                        {sortConfig.key === "timestamp" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortAmountUp className="ml-1" size={12} />
                          ) : (
                            <FaSortAmountDown className="ml-1" size={12} />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">Customer</div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center">
                        Amount
                        {sortConfig.key === "amount" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortAmountUp className="ml-1" size={12} />
                          ) : (
                            <FaSortAmountDown className="ml-1" size={12} />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        {sortConfig.key === "status" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortAmountUp className="ml-1" size={12} />
                          ) : (
                            <FaSortAmountDown className="ml-1" size={12} />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Source
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No payment records found
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.reference || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(payment.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{payment.customer?.username || "N/A"}</div>
                          <div className="text-gray-500 text-xs">
                            {payment.customer?.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₦{payment.amount?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === "success"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payment.status || "unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {payment.sourceLabel || payment.source || "System"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <FaEye className="inline" /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-gray-500 text-sm">
                Showing {filteredPayments.length} of {payments.length}{" "}
                transactions
              </div>

              <div className="flex space-x-2">
                <button
                  className="btn-outline text-sm py-1 px-2"
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage === 1 || loading}
                >
                  Previous
                </button>
                <span className="px-2 py-1 bg-gray-100 rounded">
                  Page {pagination.currentPage}
                </span>
                <button
                  className="btn-outline text-sm py-1 px-2"
                  onClick={handleNextPage}
                  disabled={
                    filteredPayments.length < pagination.pageSize || loading
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Payment Details</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Reference
                  </h3>
                  <p className="font-mono">
                    {selectedPayment.reference || "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Date
                  </h3>
                  <p>{formatDate(selectedPayment.timestamp)}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Status
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPayment.status === "success"
                        ? "bg-green-100 text-green-800"
                        : selectedPayment.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedPayment.status || "unknown"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Amount
                  </h3>
                  <p className="text-lg font-semibold">
                    ₦{selectedPayment.amount?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Customer
                </h3>
                <p>{selectedPayment.customer?.name || "N/A"}</p>
                <p className="text-gray-500">
                  {selectedPayment.customer?.email || "N/A"}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Metadata
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs">
                    {JSON.stringify(selectedPayment.metadata || {}, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Enhanced payment details */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Payment Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {formatPaymentDetails(selectedPayment).map(
                    (detail, index) => (
                      <div key={index} className="grid grid-cols-2">
                        <span className="text-gray-600">{detail.label}:</span>
                        <span className="font-medium">{detail.value}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="btn-outline"
                >
                  Close
                </button>

                {selectedPayment.status === "success" && (
                  <button
                    className="btn-outline text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                    onClick={() => {
                      alert("Refund functionality would be implemented here");
                      // In a real app, you would implement refund logic here
                    }}
                  >
                    Process Refund
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
