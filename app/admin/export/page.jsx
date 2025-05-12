"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../../components/AdminLayout";
import {
  FaFileExcel,
  FaFileCsv,
  FaFilePdf,
  FaPrint,
  FaChartPie,
  FaUserFriends,
  FaMoneyBill,
  FaTshirt,
  FaClipboard,
  FaDownload,
  FaFileAlt,
} from "react-icons/fa";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { getVoteStatistics } from "../../../lib/votes";

export default function ExportPage() {
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportType, setExportType] = useState("votes");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [exportOptions, setExportOptions] = useState({
    includeDetails: true,
    onlyActive: false,
    limit: 1000,
  });
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    // Reset preview data when export type changes
    setPreviewData(null);
  }, [exportType]);

  const loadPreviewData = async () => {
    setLoading(true);
    try {
      let data;

      switch (exportType) {
        case "votes":
          data = await loadVotesPreview();
          break;
        case "users":
          data = await loadUsersPreview();
          break;
        case "payments":
          data = await loadPaymentsPreview();
          break;
        case "summary":
          data = await loadSummaryPreview();
          break;
      }

      setPreviewData(data);
    } catch (error) {
      console.error("Error loading preview data:", error);
      alert("Failed to load preview data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadVotesPreview = async () => {
    const votesRef = collection(db, "votes");
    let votesQuery;

    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      votesQuery = query(
        votesRef,
        where("timestamp", ">=", startDate),
        where("timestamp", "<=", endDate),
        orderBy("timestamp", "desc"),
        limit(10)
      );
    } else {
      votesQuery = query(votesRef, orderBy("timestamp", "desc"), limit(10));
    }

    const snapshot = await getDocs(votesQuery);
    const votes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()?.toLocaleString() || "N/A",
    }));

    return {
      headers: ["ID", "Color", "Votes", "Amount", "Member", "Family", "Date"],
      rows: votes.map((vote) => [
        vote.id,
        vote.color,
        vote.voteCount || 1,
        `₦${vote.voteAmount?.toFixed(2) || "0.00"}`,
        vote.memberName || "Unknown",
        vote.family || "N/A",
        vote.timestamp,
      ]),
      totalCount: votes.length,
      totalVotes: votes.reduce((sum, vote) => sum + (vote.voteCount || 1), 0),
      totalAmount: votes
        .reduce((sum, vote) => sum + (vote.voteAmount || 0), 0)
        .toFixed(2),
    };
  };

  const loadUsersPreview = async () => {
    const usersRef = collection(db, "members");
    const usersQuery = query(usersRef, limit(10));
    const snapshot = await getDocs(usersQuery);

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toLocaleString() || "N/A",
    }));

    return {
      headers: [
        "ID",
        "Username",
        "Display Name",
        "Family",
        "Role",
        "Created At",
      ],
      rows: users.map((user) => [
        user.id,
        user.username || "N/A",
        user.displayName || "N/A",
        user.family || "N/A",
        user.role || "member",
        user.createdAt,
      ]),
      totalCount: users.length,
    };
  };

  const loadPaymentsPreview = async () => {
    const paymentsRef = collection(db, "payment_webhooks");
    let paymentsQuery;

    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      paymentsQuery = query(
        paymentsRef,
        where("timestamp", ">=", startDate),
        where("timestamp", "<=", endDate),
        orderBy("timestamp", "desc"),
        limit(10)
      );
    } else {
      paymentsQuery = query(
        paymentsRef,
        orderBy("timestamp", "desc"),
        limit(10)
      );
    }

    const snapshot = await getDocs(paymentsQuery);

    const payments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()?.toLocaleString() || "N/A",
    }));

    return {
      headers: ["ID", "Reference", "Amount", "Status", "Customer", "Date"],
      rows: payments.map((payment) => [
        payment.id,
        payment.reference || "N/A",
        `₦${payment.amount?.toFixed(2) || "0.00"}`,
        payment.status || "unknown",
        payment.customer?.email || "N/A",
        payment.timestamp,
      ]),
      totalCount: payments.length,
      totalAmount: payments
        .reduce((sum, payment) => sum + (payment.amount || 0), 0)
        .toFixed(2),
    };
  };

  const loadSummaryPreview = async () => {
    const stats = await getVoteStatistics();

    const colorStats = Object.entries(stats.colorVotes || {}).map(
      ([color, data]) => ({
        color,
        votes: data.votes || 0,
        amount: data.amount || 0,
      })
    );

    return {
      headers: ["Color", "Votes", "Amount", "Percentage"],
      rows: colorStats.map((stat) => [
        stat.color,
        stat.votes,
        `₦${stat.amount.toFixed(2)}`,
        `${(
          (stat.votes / colorStats.reduce((sum, s) => sum + s.votes, 0)) *
          100
        ).toFixed(1)}%`,
      ]),
      totalVotes: colorStats.reduce((sum, stat) => sum + stat.votes, 0),
      totalAmount: colorStats
        .reduce((sum, stat) => sum + stat.amount, 0)
        .toFixed(2),
    };
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      if (!previewData) {
        await loadPreviewData();
      }

      switch (exportFormat) {
        case "csv":
          exportAsCSV();
          break;
        case "excel":
          exportAsExcel();
          break;
        case "pdf":
          exportAsPDF();
          break;
        case "print":
          window.print();
          break;
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportAsCSV = () => {
    if (!previewData) return;

    // Prepare CSV content
    const headers = previewData.headers.join(",");
    const rows = previewData.rows.map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
        )
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `anglican-${exportType}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsExcel = () => {
    alert(
      "Excel export would be implemented with a library like exceljs or xlsx"
    );
    // In a real implementation, you would:
    // 1. Use a library like exceljs or xlsx
    // 2. Create workbook and worksheet
    // 3. Add headers and data rows
    // 4. Style the cells as needed
    // 5. Save the file and trigger download
  };

  const exportAsPDF = () => {
    alert(
      "PDF export would be implemented with a library like jspdf or pdfmake"
    );
    // In a real implementation, you would:
    // 1. Use a library like jspdf or pdfmake
    // 2. Create a document
    // 3. Add headers, logo, and formatted data
    // 4. Save the file and trigger download
  };

  const getExportTypeIcon = () => {
    switch (exportType) {
      case "votes":
        return <FaTshirt className="text-primary-500" />;
      case "users":
        return <FaUserFriends className="text-blue-500" />;
      case "payments":
        return <FaMoneyBill className="text-green-500" />;
      case "summary":
        return <FaChartPie className="text-purple-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  const getFormatIcon = () => {
    switch (exportFormat) {
      case "csv":
        return <FaFileCsv className="text-green-500" />;
      case "excel":
        return <FaFileExcel className="text-green-700" />;
      case "pdf":
        return <FaFilePdf className="text-red-500" />;
      case "print":
        return <FaPrint className="text-blue-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Panel - Export Options */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Export Options</h2>

            <div className="space-y-6">
              {/* Export Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data to Export
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`p-3 rounded-lg flex flex-col items-center justify-center border-2 ${
                      exportType === "votes"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setExportType("votes")}
                  >
                    <FaTshirt
                      className={`text-xl mb-2 ${
                        exportType === "votes"
                          ? "text-primary-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={exportType === "votes" ? "font-medium" : ""}
                    >
                      Votes
                    </span>
                  </button>

                  <button
                    className={`p-3 rounded-lg flex flex-col items-center justify-center border-2 ${
                      exportType === "users"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setExportType("users")}
                  >
                    <FaUserFriends
                      className={`text-xl mb-2 ${
                        exportType === "users"
                          ? "text-primary-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={exportType === "users" ? "font-medium" : ""}
                    >
                      Users
                    </span>
                  </button>

                  <button
                    className={`p-3 rounded-lg flex flex-col items-center justify-center border-2 ${
                      exportType === "payments"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setExportType("payments")}
                  >
                    <FaMoneyBill
                      className={`text-xl mb-2 ${
                        exportType === "payments"
                          ? "text-primary-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={exportType === "payments" ? "font-medium" : ""}
                    >
                      Payments
                    </span>
                  </button>

                  <button
                    className={`p-3 rounded-lg flex flex-col items-center justify-center border-2 ${
                      exportType === "summary"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setExportType("summary")}
                  >
                    <FaChartPie
                      className={`text-xl mb-2 ${
                        exportType === "summary"
                          ? "text-primary-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={exportType === "summary" ? "font-medium" : ""}
                    >
                      Summary
                    </span>
                  </button>
                </div>
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`p-3 rounded-lg flex flex-col items-center justify-center border-2 ${
                      exportFormat === "csv"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setExportFormat("csv")}
                  >
                    <FaFileCsv
                      className={`text-xl mb-2 ${
                        exportFormat === "csv"
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={exportFormat === "csv" ? "font-medium" : ""}
                    >
                      CSV
                    </span>
                  </button>

                  <button
                    className={`p-3 rounded-lg flex flex-col items-center justify-center border-2 ${
                      exportFormat === "excel"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setExportFormat("excel")}
                  >
                    <FaFileExcel
                      className={`text-xl mb-2 ${
                        exportFormat === "excel"
                          ? "text-green-700"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={exportFormat === "excel" ? "font-medium" : ""}
                    >
                      Excel
                    </span>
                  </button>

                  <button
                    className={`p-3 rounded-lg flex flex-col items-center justify-center border-2 ${
                      exportFormat === "pdf"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setExportFormat("pdf")}
                  >
                    <FaFilePdf
                      className={`text-xl mb-2 ${
                        exportFormat === "pdf"
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={exportFormat === "pdf" ? "font-medium" : ""}
                    >
                      PDF
                    </span>
                  </button>

                  <button
                    className={`p-3 rounded-lg flex flex-col items-center justify-center border-2 ${
                      exportFormat === "print"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setExportFormat("print")}
                  >
                    <FaPrint
                      className={`text-xl mb-2 ${
                        exportFormat === "print"
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={exportFormat === "print" ? "font-medium" : ""}
                    >
                      Print
                    </span>
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range (Optional)
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeDetails}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          includeDetails: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Include detailed information
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.onlyActive}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          onlyActive: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Only include active records
                    </span>
                  </label>
                </div>

                <div className="mt-3">
                  <label className="block text-xs text-gray-500 mb-1">
                    Limit Records (0 for no limit)
                  </label>
                  <input
                    type="number"
                    value={exportOptions.limit}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        limit: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={previewData ? handleExport : loadPreviewData}
                disabled={loading}
                className="w-full btn-primary flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {previewData ? (
                      <>
                        <FaDownload className="mr-2" />
                        <span>Download {exportFormat.toUpperCase()}</span>
                      </>
                    ) : (
                      <>
                        <FaClipboard className="mr-2" />
                        <span>Preview Data</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview and Export */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Data Preview</h2>

              {previewData && (
                <div className="flex items-center text-sm text-gray-500">
                  <span>
                    Total Records:{" "}
                    {previewData.totalCount || previewData.rows.length}
                  </span>
                  {previewData.totalVotes && (
                    <span className="ml-4">
                      Total Votes: {previewData.totalVotes}
                    </span>
                  )}
                  {previewData.totalAmount && (
                    <span className="ml-4">
                      Total Amount: ₦{previewData.totalAmount}
                    </span>
                  )}
                </div>
              )}
            </div>

            {!previewData ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  {getExportTypeIcon()}
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {exportType.charAt(0).toUpperCase() + exportType.slice(1)}{" "}
                  Data Preview
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  Click "Preview Data" to see a sample of the data that will be
                  exported. You can then customize your export options before
                  downloading.
                </p>
                <button
                  onClick={loadPreviewData}
                  disabled={loading}
                  className="btn-primary flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <FaClipboard className="mr-2" />
                      <span>Load Preview</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {previewData.headers.map((header, i) => (
                            <th
                              key={i}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  Showing {previewData.rows.length} records
                  {previewData.totalCount > previewData.rows.length &&
                    ` out of ${previewData.totalCount}`}
                </div>
              </div>
            )}

            {previewData && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => exportAsCSV()}
                    className="btn-outline flex items-center"
                  >
                    <FaFileCsv className="mr-2 text-green-500" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => exportAsExcel()}
                    className="btn-outline flex items-center"
                  >
                    <FaFileExcel className="mr-2 text-green-700" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    onClick={() => exportAsPDF()}
                    className="btn-outline flex items-center"
                  >
                    <FaFilePdf className="mr-2 text-red-500" />
                    <span>Export PDF</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="btn-outline flex items-center print:hidden"
                  >
                    <FaPrint className="mr-2 text-blue-500" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
