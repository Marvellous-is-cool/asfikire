// Test Firebase access with new security rules
// Run this in a terminal to check database connectivity

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  query,
  limit,
} = require("firebase/firestore");
const fs = require("fs");

// Load Firebase config from firebase.js
function extractFirebaseConfig() {
  try {
    const firebaseJs = fs.readFileSync("./lib/firebase.js", "utf8");

    // Extract config using regex
    const configMatch = firebaseJs.match(/firebaseConfig\s*=\s*({[\s\S]*?});/);

    if (configMatch && configMatch[1]) {
      // Clean up the config string and convert to object
      const configStr = configMatch[1]
        .replace(/\/\/.*/g, "") // Remove comments
        .replace(/,\s*}/g, "}"); // Fix trailing commas

      return eval(`(${configStr})`); // Convert string to object
    }

    throw new Error("Firebase config not found in firebase.js");
  } catch (error) {
    console.error("Error extracting Firebase config:", error);
    // Provide instructions for manual config
    console.log(
      "\nPlease create a firebase-test-config.js file with your Firebase configuration:"
    );
    console.log(`
module.exports = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-message-sender-id",
  appId: "your-app-id"
};
    `);
    process.exit(1);
  }
}

// Try to get config from firebase.js or use manual config if available
let firebaseConfig;
try {
  if (fs.existsSync("./firebase-test-config.js")) {
    firebaseConfig = require("./firebase-test-config.js");
    console.log("Using firebase-test-config.js");
  } else {
    firebaseConfig = extractFirebaseConfig();
    console.log("Using extracted config from firebase.js");
  }
} catch (error) {
  console.error("Error loading Firebase config:", error);
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebaseAccess() {
  console.log("\n=== FIREBASE ACCESS TEST ===\n");
  console.log("Testing connection to Firebase...");

  try {
    // Try to fetch a few documents from the members collection
    const membersRef = collection(db, "members");
    const q = query(membersRef, limit(3));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(
        "✅ Connected to Firebase successfully, but no members found (empty collection)."
      );
    } else {
      console.log(
        `✅ Connected to Firebase successfully! Found ${snapshot.size} members.`
      );

      // Log some basic info about the members (without sensitive data)
      console.log("\nSample members (username only):");
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`- ${data.username || "[no username]"}`);
      });
    }

    console.log("\nFirebase security rules are working correctly!");
  } catch (error) {
    console.error("❌ Error accessing Firebase:", error);
    console.log("\nPossible issues:");
    console.log("1. Firebase security rules might not be deployed correctly");
    console.log("2. Firebase configuration might be incorrect");
    console.log("3. Internet connection issue");
    console.log("\nTry running the deploy-firebase-rules.sh script:");
    console.log("chmod +x deploy-firebase-rules.sh");
    console.log("./deploy-firebase-rules.sh");
  }

  console.log("\n=== TEST COMPLETE ===");
}

// Run the test
testFirebaseAccess().catch(console.error);
