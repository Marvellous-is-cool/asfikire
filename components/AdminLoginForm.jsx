"use client";
import { useState } from "react";
import { FaLock, FaCheck } from "react-icons/fa";
import { signInAdmin, setupAdminAccount } from "../lib/auth";

export default function AdminLoginForm({ onLoginSuccess }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Attempting to sign in admin");
      await signInAdmin(password);
      console.log("Admin sign in successful");
      setMessage("Login successful! Redirecting...");

      // Slight delay before redirect for better UX
      setTimeout(() => {
        onLoginSuccess();
      }, 800);
    } catch (error) {
      console.error("Login error:", error);
      setError(
        "Invalid password. Please try 'admin123' if you haven't changed the default."
      );
    } finally {
      setLoading(false);
    }
  };

  const setupAdmin = async () => {
    try {
      await setupAdminAccount();
      setMessage(
        "Admin account initialized. Try logging in with the default password 'admin123'"
      );
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Error setting up admin account:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <div className="bg-primary-100 p-4 rounded-full">
            <FaLock className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Admin Access
        </h2>
        <p className="text-gray-600 text-center mb-2">
          Enter your credentials to access the admin dashboard
        </p>
        <p className="text-primary-600 text-center text-sm mb-8">
          Admin URL: <code>/admin</code>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value="admin"
              disabled
              className="w-full px-4 py-2 border rounded-md bg-gray-50"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter password"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm flex items-center">
              <FaCheck className="mr-2" /> {message}
            </div>
          )}

          <div className="text-sm mb-6">
            <p className="mb-2 text-gray-700">Default admin credentials:</p>
            <ul className="list-disc list-inside text-gray-500 space-y-1">
              <li>Username: admin</li>
              <li>Password: admin123 (unless changed in .env)</li>
            </ul>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Signing In...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={setupAdmin}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            Setup Admin Account
          </button>
        </div>
      </div>
    </div>
  );
}
