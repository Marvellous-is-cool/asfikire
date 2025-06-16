// Anglican Auth Debug & Troubleshooting Script
// Run this in browser console to debug auth issues with usernames

console.log("=== Anglican Auth Debug ===");
console.log("v2.0 - Enhanced Username Troubleshooting");

// Check localStorage for auth data
const authData = localStorage.getItem("anglican_auth");
console.log("Current localStorage auth data:", authData);

// Parse and display auth data
let parsed = null;
if (authData) {
  try {
    parsed = JSON.parse(authData);
    console.log("Parsed auth data:", parsed);

    console.log(
      "%c Authentication Details",
      "font-weight: bold; color: #4a6da7"
    );
    console.log("Username:", parsed.username);
    console.log("Family:", parsed.family);
    console.log("UID:", parsed.uid);
    console.log("Is Guest:", parsed.isGuest);
    console.log("Is Temporary:", parsed.isTemporary);

    // Check for potential issues
    if (!parsed.username) {
      console.warn("⚠️ Warning: Username is missing!");
    }
  } catch (e) {
    console.error("Error parsing auth data:", e);
  }
}

// Helper functions for auth debugging
window.anglicanAuthDebug = {
  // View current auth data
  showAuth: () => {
    const data = localStorage.getItem("anglican_auth");
    console.log("Current auth:", data ? JSON.parse(data) : "Not set");
    return data ? JSON.parse(data) : null;
  },

  // Clear auth data
  clearAuth: () => {
    localStorage.removeItem("anglican_auth");
    console.log("✅ Auth data cleared");
  },

  // Set username manually (for testing)
  setUsername: (username) => {
    if (!authData) {
      console.error("❌ No auth data to modify");
      return;
    }

    try {
      const data = JSON.parse(authData);
      data.username = username;
      localStorage.setItem("anglican_auth", JSON.stringify(data));
      console.log(`✅ Username changed to "${username}"`);
      return data;
    } catch (e) {
      console.error("❌ Error setting username:", e);
    }
  },

  // Compare usernames (input vs stored)
  compareUsername: (inputUsername) => {
    if (!authData) {
      console.error("❌ No stored auth data to compare");
      return;
    }

    try {
      const data = JSON.parse(authData);
      console.log(`Input username: "${inputUsername}"`);
      console.log(`Stored username: "${data.username}"`);

      if (inputUsername.toLowerCase() === data.username.toLowerCase()) {
        console.log("✅ Usernames match (case-insensitive)");
      } else {
        console.warn("⚠️ Usernames don't match!");
      }
    } catch (e) {
      console.error("❌ Error comparing usernames:", e);
    }
  },
};

console.log("%c Debug Commands Available:", "font-weight: bold; color: green");
console.log("- anglicanAuthDebug.showAuth() - View current auth data");
console.log("- anglicanAuthDebug.clearAuth() - Clear auth data");
console.log("- anglicanAuthDebug.setUsername('name') - Set username manually");
console.log("- anglicanAuthDebug.compareUsername('name') - Compare usernames");

console.log("=== End Debug ===");
