// Anglican Username Display Test Script
// Add this to your browser console to verify the username fix

console.log("🔍 ANGLICAN USERNAME TEST SCRIPT");
console.log("--------------------------------");

// Check current localStorage state
const checkLocalStorage = () => {
  const anglican_auth = localStorage.getItem("anglican_auth");
  console.log(
    "📊 Current localStorage anglican_auth:",
    anglican_auth ? JSON.parse(anglican_auth) : "Not set"
  );
};

// Test username authentication
const testUsernameAuth = async (username) => {
  console.log(`🔄 Testing authentication for "${username}"...`);

  try {
    // This assumes your auth function is globally available
    // You may need to modify this part based on how your app is structured
    const result = await window.testAuth(username);

    console.log("✅ Authentication Result:", result);
    console.log(`📌 Input Username: "${username}"`);
    console.log(`📌 Returned Username: "${result.username}"`);

    if (username.toLowerCase() !== result.username.toLowerCase()) {
      console.warn(
        "⚠️ WARNING: Input username and returned username don't match!"
      );
    } else {
      console.log("✅ SUCCESS: Username preserved correctly!");
    }
  } catch (error) {
    console.error("❌ Authentication Error:", error);
  }
};

// Store current localStorage
const originalStorage = localStorage.getItem("anglican_auth");

// Helper to restore original state
const restoreOriginalState = () => {
  if (originalStorage) {
    localStorage.setItem("anglican_auth", originalStorage);
  } else {
    localStorage.removeItem("anglican_auth");
  }
  console.log("🔄 Original localStorage state restored");
};

// Make test function available globally
window.testAuth = async (username) => {
  // Clear any existing auth
  localStorage.removeItem("anglican_auth");

  // Import the auth functions if needed
  if (!window.autoAuthenticateMember) {
    console.log("⚙️ Loading auth functions...");
    // This assumes your app structure - adjust as needed
    const authModule = await import("/lib/auth.js");
    window.autoAuthenticateMember = authModule.autoAuthenticateMember;
    window.checkUsernameExists = authModule.checkUsernameExists;
  }

  // Run the actual authentication
  const exists = await window.checkUsernameExists(username);
  if (!exists) {
    throw new Error(`Username "${username}" not found in database`);
  }

  return await window.autoAuthenticateMember(username);
};

// Make test functions available globally
window.runUsernameTest = async (username = "marvellous") => {
  checkLocalStorage();
  await testUsernameAuth(username);
  checkLocalStorage();
};

window.restoreState = restoreOriginalState;

console.log("📋 TEST INSTRUCTIONS:");
console.log("1. Run test with: window.runUsernameTest()");
console.log(
  "2. Or test specific username: window.runUsernameTest('yourUsername')"
);
console.log("3. Restore original state with: window.restoreState()");
