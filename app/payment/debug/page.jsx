"use client";
import { useState, useEffect } from "react";
import { useSettings } from "../../../contexts/SettingsContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import {
  FaExclamationTriangle,
  FaBug,
  FaKey,
  FaServer,
  FaLink,
} from "react-icons/fa";
import AdminLayout from "../../../components/AdminLayout";

export default function PaymentDebugPage() {
  const { settings } = useSettings();
  const [paystackPublicKey, setPaystackPublicKey] = useState(null);
  const [paystackSecretKeyStatus, setPaystackSecretKeyStatus] = useState(null);
  const [testMode, setTestMode] = useState(true);
  const [initTest, setInitTest] = useState({
    loading: false,
    result: null,
    error: null,
  });
  const [urlParameters, setUrlParameters] = useState({});

  useEffect(() => {
    async function checkConfig() {
      setPaystackPublicKey(
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
          settings?.payments?.paystackPublicKey
      );
      setTestMode(settings?.payments?.paystackTestMode || true);

      // Check if secret key is set
      try {
        const response = await fetch("/api/payment/debug-config");
        const data = await response.json();
        setPaystackSecretKeyStatus(data.secretKeyStatus);
      } catch (error) {
        console.error("Error checking secret key:", error);
        setPaystackSecretKeyStatus("error");
      }

      // Get URL parameters if any
      if (typeof window !== "undefined") {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
        setUrlParameters(params);
      }
    }

    checkConfig();
  }, [settings]);

  async function runInitTest() {
    setInitTest({ loading: true, result: null, error: null });

    try {
      const testPayload = {
        amount: 1000, // 10 naira in kobo
        email: "test@example.com",
        metadata: { test: true },
        callback_url: window.location.origin + "/payment/callback",
      };

      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      });

      const data = await response.json();
      setInitTest({ loading: false, result: data, error: null });
    } catch (error) {
      console.error("Test initialization error:", error);
      setInitTest({ loading: false, result: null, error: error.message });
    }
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Payment Debug</h1>

          <div className="flex gap-2">
            <button
              onClick={runInitTest}
              disabled={initTest.loading}
              className="btn-primary"
            >
              {initTest.loading ? "Testing..." : "Test Initialization"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Configuration Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <FaKey className="mr-2 text-blue-500" />
              Paystack Configuration
            </h2>

            <ul className="space-y-4">
              <li className="flex items-start">
                <div
                  className={`h-5 w-5 rounded-full mr-2 flex-shrink-0 ${
                    paystackPublicKey ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <div>
                  <strong>Public Key:</strong>
                  <div className="text-sm text-gray-600 break-all">
                    {paystackPublicKey
                      ? paystackPublicKey.substring(0, 10) + "..."
                      : "Not configured"}
                  </div>
                </div>
              </li>

              <li className="flex items-start">
                <div
                  className={`h-5 w-5 rounded-full mr-2 flex-shrink-0 ${
                    paystackSecretKeyStatus === "set"
                      ? "bg-green-500"
                      : paystackSecretKeyStatus === "not-set"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                ></div>
                <div>
                  <strong>Secret Key:</strong>
                  <div className="text-sm text-gray-600">
                    {paystackSecretKeyStatus === "set"
                      ? "Set in server environment"
                      : paystackSecretKeyStatus === "not-set"
                      ? "Not configured"
                      : "Status unknown"}
                  </div>
                </div>
              </li>

              <li className="flex items-start">
                <div
                  className={`h-5 w-5 rounded-full mr-2 flex-shrink-0 ${
                    testMode ? "bg-yellow-500" : "bg-green-500"
                  }`}
                ></div>
                <div>
                  <strong>Mode:</strong>
                  <div className="text-sm text-gray-600">
                    {testMode ? "Test Mode" : "Live Mode"}
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* URL Parameters */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <FaLink className="mr-2 text-blue-500" />
              URL Parameters
            </h2>

            {Object.keys(urlParameters).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(urlParameters).map(([key, value]) => (
                  <li key={key} className="flex">
                    <strong className="mr-2">{key}:</strong>
                    <span className="text-gray-600 break-all">{value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No URL parameters present</p>
            )}
          </div>
        </div>

        {/* Test Result */}
        {(initTest.result || initTest.error) && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              initTest.error ? "bg-red-50" : "bg-green-50"
            }`}
          >
            <h2 className="text-lg font-bold mb-4 flex items-center">
              {initTest.error ? (
                <>
                  <FaExclamationTriangle className="mr-2 text-red-500" /> Test
                  Failed
                </>
              ) : (
                <>
                  <FaServer className="mr-2 text-green-500" /> Test Result
                </>
              )}
            </h2>

            {initTest.error ? (
              <div className="text-red-700">{initTest.error}</div>
            ) : (
              <div>
                <pre className="bg-white p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(initTest.result, null, 2)}
                </pre>

                {initTest.result?.data?.authorization_url && (
                  <div className="mt-4">
                    <a
                      href={initTest.result.data.authorization_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      Open Payment Page
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
