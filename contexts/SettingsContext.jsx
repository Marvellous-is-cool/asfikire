"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// Create the context
const SettingsContext = createContext(null);

// Default settings structure
const defaultSettings = {
  general: {
    siteName: "Anglican Student Fellowship",
    siteDescription: "Helping students connect with faith",
    contactEmail: "admin@anglican-fellowship.com",
    logoUrl: "/logo.png",
  },
  voting: {
    votingEnabled: true,
    votingStartDate: "",
    votingEndDate: "",
    pricePerVote: 100,
    minimumVotes: 1,
    maximumVotes: 100,
    allowAnonymousVoting: true,
    requireAuthentication: true,
    resultsVisibility: "admin-only",
    displayLeaderboard: true,
    shirtOptions: [
      { id: "wine", name: "Wine", hex: "#722F37", enabled: true },
      { id: "white", name: "White", hex: "#FFFFFF", enabled: true },
      { id: "black", name: "Black", hex: "#000000", enabled: true }, // Changed from green to black
    ],
  },
  payments: {
    paymentProvider: "paystack",
    paystackPublicKey: "",
    paystackTestMode: true,
    currency: "NGN",
    receiptEnabled: true,
    paymentSuccessMessage: "Thank you for your vote!",
    paymentFailureMessage:
      "We couldn't process your payment. Please try again.",
    paymentNotifications: true,
  },
  notifications: {
    adminEmailNotifications: true,
    userEmailNotifications: false,
    emailTemplate: "default",
    adminVoteNotification: true,
    adminPaymentNotification: true,
    adminUserRegistrationNotification: true,
  },
  gallery: {
    enabled: true,
    images: [
      {
        id: "fellowship1",
        src: "/fellowship.jpeg",
        alt: "Fellowship prayer meeting",
        enabled: true,
      },
      {
        id: "fellowship2",
        src: "/fellowship2.jpg",
        alt: "Bible study group",
        enabled: true,
      },
      {
        id: "learning",
        src: "/learning.jpeg",
        alt: "The Word at His Feet",
        enabled: true,
      },
      {
        id: "worship",
        src: "/worship.jpeg",
        alt: "Worship service",
        enabled: true,
      },
      {
        id: "social",
        src: "/social.jpeg",
        alt: "Social gathering",
        enabled: true,
      },
    ],
  },
  contact: {
    address:
      "Anglican Students Fellowship, Opposite DanDaves Hostel, Atoto, Ikire, Osun State University, Ikire Campus",
    email: "info@anglicansfikire.org",
    phone: "+234 81 33 73 0145",
    socialLinks: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
    },
    programSchedule: [
      {
        name: "Sunday Fellowship",
        time: "Every Sunday, 8:00 AM - 6:00 PM",
        location:
          "Anglican Student Fellowship, Opposite DanDaves Hostel, Atoto, Ikire Campus",
      },
      {
        name: "Bible Study",
        time: "Mondays, 5:00 PM - 6:30 PM",
        location: "Auditorium, Opposite DanDaves Hostel, Atoto",
      },
      {
        name: "Prayer Meeting",
        time: "Wednesdays, 5:00 PM - 6:00 PM",
        location: "Auditorium, Opposite DanDaves Hostel, Atoto",
      },
    ],
  },
};

// Provider component
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if voting is enabled based on dates and the enabled flag
  const isVotingEnabled = () => {
    if (!settings.voting.votingEnabled) return false;

    const now = new Date();
    const startDate = settings.voting.votingStartDate
      ? new Date(settings.voting.votingStartDate)
      : null;
    const endDate = settings.voting.votingEndDate
      ? new Date(settings.voting.votingEndDate)
      : null;

    // If no dates are set, just use the enabled flag
    if (!startDate && !endDate) return settings.voting.votingEnabled;

    // Check if current date is within range
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;

    return true;
  };

  // Get enabled shirt colors
  const getEnabledColors = () => {
    return settings.voting.shirtOptions.filter((color) => color.enabled);
  };

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settingsDoc = await getDoc(doc(db, "settings", "app"));

        if (settingsDoc.exists()) {
          // Merge with defaults to ensure we have all fields
          const fetchedSettings = settingsDoc.data();

          // Deep merge to handle nested objects
          const mergedSettings = {
            ...defaultSettings,
            ...fetchedSettings,
            general: {
              ...defaultSettings.general,
              ...fetchedSettings.general,
            },
            voting: {
              ...defaultSettings.voting,
              ...fetchedSettings.voting,
              shirtOptions:
                fetchedSettings.voting?.shirtOptions ||
                defaultSettings.voting.shirtOptions,
            },
            payments: {
              ...defaultSettings.payments,
              ...fetchedSettings.payments,
            },
            notifications: {
              ...defaultSettings.notifications,
              ...fetchedSettings.notifications,
            },
            gallery: {
              ...defaultSettings.gallery,
              ...fetchedSettings.gallery,
              images:
                fetchedSettings.gallery?.images ||
                defaultSettings.gallery.images,
            },
            contact: {
              ...defaultSettings.contact,
              ...fetchedSettings.contact,
              socialLinks: {
                ...defaultSettings.contact.socialLinks,
                ...fetchedSettings.contact?.socialLinks,
              },
              programSchedule:
                fetchedSettings.contact?.programSchedule ||
                defaultSettings.contact.programSchedule,
            },
          };

          setSettings(mergedSettings);
        }

        setError(null);
      } catch (err) {
        console.error("Error loading settings:", err);
        setError("Failed to load settings. Using defaults.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        isVotingEnabled,
        getEnabledColors,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook for using settings
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
