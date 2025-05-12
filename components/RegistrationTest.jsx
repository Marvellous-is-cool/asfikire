import { useState } from "react";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

export default function RegistrationTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTest = async (e) => {
    e.preventDefault();
    setResult(null);
    setError(null);

    try {
      // Log environment variables
      console.log("API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
      console.log("Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
      console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

      // Create a direct Firebase config
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      console.log("Testing with config:", config);

      // Initialize directly for testing
      const testApp = initializeApp(config, "testApp");
      const testAuth = getAuth(testApp);

      // Try to create a user
      const userCredential = await createUserWithEmailAndPassword(
        testAuth,
        email,
        password
      );

      setResult(JSON.stringify(userCredential.user, null, 2));
    } catch (error) {
      console.error("Test error:", error);
      setError(error.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 my-6">
      <h2 className="text-lg font-bold mb-4">Firebase Auth Test</h2>

      <form onSubmit={handleTest}>
        <div className="mb-4">
          <label className="block text-sm mb-1">Test Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="test@example.com"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Test Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="Password (min 6 chars)"
            required
          />
        </div>

        <button type="submit" className="btn-primary">
          Test Firebase Auth
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
          <p className="font-medium">Error:</p>
          <pre className="text-sm mt-1 overflow-auto">{error}</pre>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg">
          <p className="font-medium">Success! User created:</p>
          <pre className="text-sm mt-1 overflow-auto">{result}</pre>
        </div>
      )}
    </div>
  );
}
