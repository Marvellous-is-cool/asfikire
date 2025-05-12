"use client";
import { useState } from "react";
import { FaBug, FaTimes } from "react-icons/fa";

export default function PaymentDebugPanel({ data }) {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV === "production") {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBug />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Payment Debug Panel</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-4">
              <h3 className="font-medium mb-2">Current URL Parameters:</h3>
              <pre className="bg-gray-100 p-3 rounded mb-4 text-sm overflow-auto">
                {JSON.stringify(
                  Object.fromEntries(
                    new URL(window.location.href).searchParams
                  ),
                  null,
                  2
                )}
              </pre>

              <h3 className="font-medium mb-2">Payment Data:</h3>
              <pre className="bg-gray-100 p-3 rounded mb-4 text-sm overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>

              <h3 className="font-medium mb-2">Debug Actions:</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => {
                    const search = new URLSearchParams(window.location.search);
                    if (search.has("reference")) {
                      navigator.clipboard.writeText(search.get("reference"));
                      alert("Reference copied to clipboard");
                    } else {
                      alert("No reference found in URL");
                    }
                  }}
                >
                  Copy Reference
                </button>

                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => {
                    window.location.href =
                      "/payment/callback?reference=test_reference&trxref=test_reference";
                  }}
                >
                  Simulate Callback
                </button>

                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => {
                    console.clear();
                    console.log("Debug console cleared");
                  }}
                >
                  Clear Console
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
