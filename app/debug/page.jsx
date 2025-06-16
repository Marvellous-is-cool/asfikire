"use client";
import DatabaseDebugger from "../../components/DatabaseDebugger";
import UserFixUtility from "../../components/UserFixUtility";

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Debug Page</h1>

        <div className="mb-8">
          <UserFixUtility />
        </div>

        <div className="mb-8">
          <DatabaseDebugger />
        </div>

        <div className="mt-8 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Debug Instructions</h2>
          <div className="space-y-3 text-sm">
            <p>
              <strong>1.</strong> Use the Username Conflict Resolution tool
              above to find and fix duplicate usernames.
            </p>
            <p>
              <strong>2.</strong> Use the Database Debugger to search for
              specific usernames and see what's in the database.
            </p>
            <p>
              <strong>3.</strong> Open browser console and run the debug script
              to check localStorage:
            </p>
            <code className="block bg-gray-100 p-2 rounded mt-2">
              {`// Copy the content from debug-auth.js and paste in console`}
            </code>
            <p>
              <strong>4.</strong> Clear localStorage if needed:
            </p>
            <code className="block bg-gray-100 p-2 rounded mt-2">
              localStorage.removeItem("anglican_auth");
            </code>
            <p>
              <strong>5.</strong> Test authentication with different usernames
              to see the console logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
