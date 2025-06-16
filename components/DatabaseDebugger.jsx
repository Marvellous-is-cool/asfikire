"use client";
import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { autoAuthenticateMember, checkUsernameExists } from "../lib/auth";

export default function DatabaseDebugger() {
  const [searchUsername, setSearchUsername] = useState("");
  const [results, setResults] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auth testing state
  const [testUsername, setTestUsername] = useState("");
  const [authResult, setAuthResult] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const searchUser = async () => {
    if (!searchUsername.trim()) return;

    setLoading(true);
    try {
      const usersRef = collection(db, "members");
      const q = query(
        usersRef,
        where("username", "==", searchUsername.toLowerCase())
      );
      const querySnapshot = await getDocs(q);

      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setResults(users);
      console.log(`Search results for "${searchUsername}":`, users);
    } catch (error) {
      console.error("Error searching user:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "members");
      const querySnapshot = await getDocs(usersRef);

      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setAllUsers(users);
      console.log("All users:", users);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const testAuthentication = async () => {
    if (!testUsername.trim()) return;

    setAuthLoading(true);
    setAuthResult(null);

    try {
      console.log(`Testing authentication for: "${testUsername}"`);

      // First check if username exists
      const exists = await checkUsernameExists(testUsername);
      console.log(`Username exists check: ${exists}`);

      if (exists) {
        // Try to authenticate
        const authData = await autoAuthenticateMember(testUsername);
        console.log(`Authentication result:`, authData);
        setAuthResult({
          success: true,
          exists: true,
          data: authData,
        });
      } else {
        setAuthResult({
          success: false,
          exists: false,
          message: "Username not found",
        });
      }
    } catch (error) {
      console.error("Authentication test error:", error);
      setAuthResult({
        success: false,
        exists: false,
        error: error.message,
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Database Debugger</h2>

      <div className="space-y-6">
        {/* Search specific user */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Search User</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Enter username to search"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={searchUser}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {results && (
            <div className="mt-4">
              <h4 className="font-medium">Results:</h4>
              {results.length === 0 ? (
                <p className="text-gray-500">No users found</p>
              ) : (
                <div className="space-y-2">
                  {results.map((user, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p>
                        <strong>ID:</strong> {user.id}
                      </p>
                      <p>
                        <strong>Username:</strong> {user.username}
                      </p>
                      <p>
                        <strong>Display Name:</strong> {user.displayName}
                      </p>
                      <p>
                        <strong>Family:</strong> {user.family}
                      </p>
                      <p>
                        <strong>UID:</strong> {user.uid}
                      </p>
                      <p>
                        <strong>Is Guest:</strong> {user.isGuest ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {user.createdAt?.toDate?.()?.toString() || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Load all users */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">All Users</h3>
          <button
            onClick={loadAllUsers}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load All Users"}
          </button>

          {allUsers.length > 0 && (
            <div className="mt-4 max-h-96 overflow-y-auto">
              <h4 className="font-medium">All Users ({allUsers.length}):</h4>
              <div className="space-y-2">
                {allUsers.map((user, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                    <span className="font-medium">{user.username}</span>
                    {user.displayName !== user.username && (
                      <span className="text-gray-600">
                        {" "}
                        ({user.displayName})
                      </span>
                    )}
                    <span className="text-gray-500"> - {user.family}</span>
                    {user.isGuest && (
                      <span className="text-blue-500"> [Guest]</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Authentication testing */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Authentication Test</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={testUsername}
              onChange={(e) => setTestUsername(e.target.value)}
              placeholder="Enter username to test"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={testAuthentication}
              disabled={authLoading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {authLoading ? "Testing..." : "Test Authentication"}
            </button>
          </div>

          {authResult && (
            <div className="mt-4">
              <h4 className="font-medium">Authentication Result:</h4>
              <div
                className={`p-3 rounded ${
                  authResult.success
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {authResult.success ? (
                  <div>
                    <p>
                      <strong>✅ Success:</strong> User authenticated
                    </p>
                    <div className="mt-2 text-sm bg-white p-2 rounded">
                      <p>
                        <strong>Input Username:</strong> {testUsername}
                      </p>
                      <p>
                        <strong>Returned Username:</strong>{" "}
                        {authResult.data.username}
                      </p>
                      <p>
                        <strong>Display Name:</strong>{" "}
                        {authResult.data.displayName}
                      </p>
                      <p>
                        <strong>Family:</strong> {authResult.data.family}
                      </p>
                      <p>
                        <strong>UID:</strong> {authResult.data.uid}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>
                    <strong>❌ Error:</strong>{" "}
                    {authResult.message || authResult.error}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Fix Tools */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Username Fix Utility</h3>
          <p className="text-gray-600 mb-2 text-sm">
            The Username Fix Utility can help you detect and resolve duplicate
            usernames that may be causing the inconsistent display issues.
          </p>
          <div className="flex items-center">
            <a
              href="#user-fix-utility"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Scroll to Username Fix Utility
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
