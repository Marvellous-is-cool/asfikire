"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminNav from "./AdminNav";
import AdminMobileNav from "./AdminMobileNav";
import { logoutUser, isAdminAuthenticated } from "../lib/auth";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  // Check authentication every minute to ensure session is still valid
  useEffect(() => {
    // Initial auth check
    checkAuth();

    // Set up periodic checks
    const authInterval = setInterval(() => {
      if (!isAdminAuthenticated()) {
        console.log("Admin session expired");
        setError("Your session has expired. Please log in again.");
        setTimeout(() => router.push("/admin"), 2000);
      }
    }, 60000); // Check every minute

    // Monitor network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(authInterval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  // Authentication check function
  const checkAuth = () => {
    try {
      setLoading(true);
      const authenticated = isAdminAuthenticated();

      if (!authenticated) {
        console.log("Not authenticated as admin, redirecting");
        router.push("/admin");
        return;
      }

      console.log("Admin authentication verified");
      setError(null);
    } catch (err) {
      console.error("Error checking admin auth:", err);
      setError("Authentication error. Please try logging in again.");
      setTimeout(() => router.push("/admin"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      console.log("Admin logged out successfully");
      router.push("/admin");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if there's an error
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminAuthenticated");
        localStorage.removeItem("adminLoginTime");
      }
      router.push("/admin");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border-l-4 border-red-500 max-w-md">
          <h2 className="font-bold mb-2">Authentication Error</h2>
          <p>{error}</p>
          <p className="text-sm mt-2">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav onLogout={handleLogout} />

      <div className="flex flex-col flex-1">
        <AdminMobileNav onLogout={handleLogout} />

        {!isOnline && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-2 text-center text-yellow-800 text-sm">
            You are currently offline. Some features may be unavailable until
            you reconnect.
          </div>
        )}

        <motion.main
          className="flex-1 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.main>

        <footer className="bg-white border-t p-4 text-center text-xs text-gray-500">
          <p>
            Anglican Student Fellowship Admin Dashboard • &copy;{" "}
            {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
