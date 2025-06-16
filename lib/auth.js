import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// List of available families in the fellowship
export const FAMILIES = [
  "family One",
  "family Two",
  "family Three",
  "family Four",
];

// Check if username exists - Improve error handling and logging
export async function checkUsernameExists(username) {
  if (!username || username.trim() === "") {
    console.error("Empty username provided to checkUsernameExists");
    throw new Error("Username cannot be empty");
  }

  try {
    console.log(`Checking if username exists: "${username}"`);
    const usersRef = collection(db, "members");
    const q = query(usersRef, where("username", "==", username.toLowerCase()));
    const querySnapshot = await getDocs(q);

    const exists = !querySnapshot.empty;
    console.log(`Username "${username}" exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error("Error checking username:", error);

    // Check if it's a permission error and provide helpful guidance
    if (error.code === "permission-denied") {
      throw new Error(
        `Permission denied: Please update your Firebase security rules. The current rules may have expired.`
      );
    }

    // Return more specific error message to help debugging
    throw new Error(`Username check failed: ${error.message}`);
  }
}

// Register a new member
export async function registerMember(username, family, password) {
  try {
    // Create a sanitized email from username for Firebase Auth
    // (Firebase Auth requires emails, so we create a fake one)
    const email = `${username.toLowerCase()}@anglican-fellowship.com`;
    const auth = getAuth();

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Create member record in Firestore
    await setDoc(doc(db, "members", user.uid), {
      uid: user.uid,
      username: username.toLowerCase(),
      displayName: username,
      family,
      createdAt: serverTimestamp(),
      role: "member",
    });

    return user;
  } catch (error) {
    console.error("Error registering member:", error);
    throw error;
  }
}

// Sign in a member (with password)
export async function signInMember(username, password) {
  try {
    // Convert username to email format
    const email = `${username.toLowerCase()}@anglican-fellowship.com`;
    const auth = getAuth();

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return userCredential.user;
  } catch (error) {
    console.error("Error signing in member:", error);
    throw error;
  }
}

// Auto-authenticate a member by username only (no password required for voting)
export async function autoAuthenticateMember(username) {
  try {
    console.log(`Auto-authenticating user with username: "${username}"`);

    // Check if the username exists first in Firestore
    const exists = await checkUsernameExists(username);
    if (!exists) {
      console.log(`Username "${username}" not found, will create as guest`);
      throw new Error("Username not found");
    }

    // Get member data from Firestore
    const usersRef = collection(db, "members");
    const q = query(usersRef, where("username", "==", username.toLowerCase()));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log(
        `Found ${querySnapshot.docs.length} matching documents for "${username}"`
      );

      // Log all matching documents to debug potential duplicates
      querySnapshot.docs.forEach((doc, index) => {
        console.log(`Match ${index + 1}:`, doc.id, doc.data());
      });

      const userData = querySnapshot.docs[0].data();
      console.log(`Using first match for "${username}":`, userData);

      // IMPORTANT: Always use the input username, not the stored one
      // This prevents the wrong username being displayed
      const result = {
        uid: userData.uid || "temp-" + Date.now(),
        email: `${username.toLowerCase()}@anglican-fellowship.com`,
        displayName: userData.displayName || username,
        isTemporary: true,
        username: username.toLowerCase(), // Always use the input username
        family: userData.family || "Guest", // Ensure family is included
      };

      console.log(`Returning auth result for "${username}":`, result);
      return result;
    }

    // If we couldn't find the user data, create a basic one
    return {
      uid: "temp-" + Date.now(),
      email: `${username.toLowerCase()}@anglican-fellowship.com`,
      displayName: username,
      isTemporary: true,
      username: username,
      family: "Guest",
    };
  } catch (error) {
    console.error("Auto-auth error:", error);
    throw error;
  }
}

// Create a new member in the database without requiring Firebase Auth
// This can be useful for allowing non-registered users to vote
export async function createGuestMember(username, family = "Guest") {
  try {
    if (!username || username.trim() === "") {
      throw new Error("Username cannot be empty");
    }

    // Check if username already exists
    const exists = await checkUsernameExists(username);
    if (exists) {
      throw new Error("Username already exists");
    }

    console.log(`Creating guest member with username: "${username}"`);

    // Generate a unique ID for this user
    const guestId = `guest-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create member record in Firestore without auth
    await setDoc(doc(db, "members", guestId), {
      uid: guestId,
      username: username.toLowerCase(),
      displayName: username,
      family, // Ensure family is stored
      createdAt: serverTimestamp(),
      role: "member",
      isGuest: true,
    });

    console.log(`Created guest member: ${username}`);

    // Return the new user object
    return {
      uid: guestId,
      username: username.toLowerCase(),
      displayName: username,
      family, // Return family in the object
      isGuest: true,
    };
  } catch (error) {
    console.error("Error creating guest member:", error);
    throw error;
  }
}

/**
 * Simple admin authentication that bypasses Firebase Auth issues
 */
export async function setupAdminAccount() {
  console.log("Setting up local admin authentication");
  try {
    // Create a localStorage entry if it doesn't exist
    if (!localStorage.getItem("adminInitialized")) {
      localStorage.setItem("adminInitialized", "true");
      console.log("Admin account initialized in local storage");
    }
  } catch (error) {
    console.error("Error in local admin setup:", error);
  }
}

export async function signInAdmin(password) {
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

  console.log("Attempting admin login with local authentication");

  // Simple password verification
  if (password !== expectedPassword) {
    console.error("Password mismatch for admin");
    throw new Error("Invalid admin password");
  }

  // Set admin session in localStorage
  localStorage.setItem("adminAuthenticated", "true");
  localStorage.setItem("adminLoginTime", Date.now().toString());

  console.log("Admin sign-in successful with local authentication");
  return { role: "admin" };
}

export function isAdminAuthenticated() {
  try {
    const authenticated = localStorage.getItem("adminAuthenticated") === "true";
    if (!authenticated) return false;

    // Check if login is within the last 24 hours
    const loginTime = parseInt(localStorage.getItem("adminLoginTime") || "0");
    const elapsed = Date.now() - loginTime;
    const oneDay = 24 * 60 * 60 * 1000;
    return elapsed < oneDay;
  } catch (error) {
    return false;
  }
}

/**
 * Logs out the current user from both admin session and Firebase Auth
 * @returns {Promise<boolean>} True if logout was successful
 */
export async function logoutUser() {
  // Clear admin authentication from localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminLoginTime");
  }

  // Sign out from Firebase Auth
  try {
    const auth = getAuth();
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error signing out from Firebase:", error);
    return true;
  }
}

/**
 * Get current user's profile
 */
export async function getCurrentMember() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;

    const memberDoc = await getDoc(doc(db, "members", user.uid));
    if (!memberDoc.exists()) return null;

    return {
      uid: user.uid,
      ...memberDoc.data(),
    };
  } catch (error) {
    console.error("Error getting current member:", error);
    return null;
  }
}
