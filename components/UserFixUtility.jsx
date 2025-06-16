"use client";
import { useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function UserFixUtility() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState("");

  const findDuplicateUsernames = async () => {
    setLoading(true);
    setMessage("");
    try {
      // Get all users from Firestore
      const usersRef = collection(db, "members");
      const querySnapshot = await getDocs(usersRef);

      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Find duplicates by username (case-insensitive)
      const usersByUsername = {};
      users.forEach((user) => {
        const username = (user.username || "").toLowerCase();
        if (!usersByUsername[username]) {
          usersByUsername[username] = [];
        }
        usersByUsername[username].push(user);
      });

      // Filter to only duplicates
      const duplicates = Object.entries(usersByUsername)
        .filter(([username, users]) => users.length > 1)
        .map(([username, users]) => ({ username, users }));

      setResults({
        totalUsers: users.length,
        duplicates,
      });

      if (duplicates.length === 0) {
        setMessage("✅ No duplicate usernames found!");
      } else {
        setMessage(`⚠️ Found ${duplicates.length} duplicate username groups.`);
      }
    } catch (error) {
      console.error("Error finding duplicates:", error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fixDuplicateUsers = async () => {
    if (!results?.duplicates?.length) {
      setMessage("No duplicates to fix");
      return;
    }

    setLoading(true);
    setMessage("");
    let fixed = 0;

    try {
      for (const { username, users } of results.duplicates) {
        // Sort users by creation date (oldest first)
        const sortedUsers = [...users].sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(0);
          const bDate = b.createdAt?.toDate?.() || new Date(0);
          return aDate - bDate;
        });

        // Keep the first (original) user
        const originalUser = sortedUsers[0];

        // For all duplicates, append a number to make usernames unique
        for (let i = 1; i < sortedUsers.length; i++) {
          const duplicateUser = sortedUsers[i];
          const newUsername = `${username}_${i}`;

          // Update the username in Firestore
          await updateDoc(doc(db, "members", duplicateUser.id), {
            username: newUsername,
            displayName: `${duplicateUser.displayName || username} (${i})`,
          });

          fixed++;
        }
      }

      setMessage(
        `✅ Fixed ${fixed} duplicate usernames. Refresh the page to see updates.`
      );
      setResults(null); // Clear results to force a refresh
    } catch (error) {
      console.error("Error fixing duplicates:", error);
      setMessage(`❌ Error fixing duplicates: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Username Conflict Resolution</h2>

      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          This utility helps you fix duplicate usernames in the database which
          may cause authentication issues. It will detect any conflicting
          usernames and make them unique by appending a number.
        </p>

        <div className="flex gap-3">
          <button
            onClick={findDuplicateUsernames}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Scan for Duplicate Usernames"}
          </button>

          {results?.duplicates?.length > 0 && (
            <button
              onClick={fixDuplicateUsers}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Fix {results.duplicates.length} Duplicate Groups
            </button>
          )}
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded ${
              message.includes("✅")
                ? "bg-green-50 text-green-700"
                : message.includes("❌")
                ? "bg-red-50 text-red-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {results && results.duplicates.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">
            Duplicate Usernames ({results.duplicates.length} groups)
          </h3>

          <div className="space-y-4">
            {results.duplicates.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">
                    Username: "{item.username}" ({item.users.length} users)
                  </h4>
                </div>

                <div className="space-y-2">
                  {item.users.map((user, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded ${
                        idx === 0
                          ? "bg-green-50 border-l-4 border-green-500"
                          : "bg-yellow-50 border-l-4 border-yellow-500"
                      }`}
                    >
                      <p>
                        <strong>
                          {idx === 0 ? "Original" : "Duplicate"} - ID:
                        </strong>{" "}
                        {user.id}
                      </p>
                      <p>
                        <strong>Display Name:</strong>{" "}
                        {user.displayName || user.username}
                      </p>
                      <p>
                        <strong>Family:</strong> {user.family || "Not set"}
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {user.createdAt?.toDate?.()?.toLocaleString() ||
                          "Unknown"}
                      </p>
                      {idx > 0 && (
                        <p className="text-sm text-gray-700">
                          Will be renamed to: {item.username}_{idx}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
