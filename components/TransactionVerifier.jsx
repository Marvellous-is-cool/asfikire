"use client";
import { useState } from "react";
import {
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";

export default function TransactionVerifier({ onVerificationComplete }) {
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (!reference) {
      setError("Please enter a transaction reference");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/payment/verify-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setResult(data);

      if (onVerificationComplete) {
        onVerificationComplete(data);
      }
    } catch (err) {
      setError(err.message || "An error occurred during verification");
      console.error("Verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Verify Transaction</h3>

      <div className="flex mb-4">
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Enter transaction reference"
          className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={loading}
        />
        <button
          onClick={handleVerify}
          disabled={loading || !reference}
          className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          <div className="flex items-center">
            <FaTimesCircle className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md">
          <div className="flex items-center mb-2">
            <FaCheckCircle className="mr-2" />
            <span className="font-medium">
              {result.alreadyExists
                ? "Transaction already exists in database"
                : "Transaction verified and added to database"}
            </span>
          </div>

          <div className="text-sm">
            <div>
              <span className="font-medium">Reference:</span>{" "}
              {result.data.reference}
            </div>
            <div>
              <span className="font-medium">Amount:</span> ₦
              {result.data.amount?.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Status:</span> {result.data.status}
            </div>
            <div>
              <span className="font-medium">Customer:</span>{" "}
              {result.data.customer?.email}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
