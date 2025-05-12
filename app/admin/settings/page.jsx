"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaSave,
  FaCheck,
  FaCog,
  FaUsers,
  FaCreditCard,
  FaTshirt,
  FaCalendarAlt,
  FaPalette,
  FaBell,
  FaGlobe,
} from "react-icons/fa";
import AdminLayout from "../../../components/AdminLayout";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState({
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
      allowAnonymousVoting: false,
      requireAuthentication: true,
      resultsVisibility: "admin-only", // admin-only, after-voting, public
      displayLeaderboard: true,
      shirtOptions: [
        { id: "wine", name: "Wine", hex: "#722F37", enabled: true },
        { id: "white", name: "White", hex: "#FFFFFF", enabled: true },
        { id: "black", name: "Black", hex: "#000000", enabled: true },
      ],
    },
    payments: {
      paymentProvider: "paystack",
      paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
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
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load settings from Firestore
        const settingsDoc = await getDoc(doc(db, "settings", "app"));

        if (settingsDoc.exists()) {
          // Merge with defaults to ensure we have all fields
          setSettings((prevSettings) => ({
            ...prevSettings,
            ...settingsDoc.data(),
          }));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading settings:", error);
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);

    try {
      // Save to Firestore
      await setDoc(doc(db, "settings", "app"), {
        ...settings,
        updatedAt: serverTimestamp(),
      });

      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [key]: value,
      },
    }));
  };

  const updateNestedSetting = (category, parentKey, index, key, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [parentKey]: prevSettings[category][parentKey].map((item, i) =>
          i === index ? { ...item, [key]: value } : item
        ),
      },
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b">
          <div className="px-6 py-5 flex justify-between items-center">
            <h1 className="text-2xl font-bold">System Settings</h1>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="btn-primary flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>

              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-green-500 flex items-center"
                >
                  <FaCheck className="mr-1" />
                  <span>Saved!</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex border-b overflow-x-auto">
            <button
              className={`px-6 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                activeTab === "general"
                  ? "border-b-2 border-primary-500 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("general")}
            >
              <FaCog className="mr-2" />
              General
            </button>

            <button
              className={`px-6 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                activeTab === "voting"
                  ? "border-b-2 border-primary-500 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("voting")}
            >
              <FaTshirt className="mr-2" />
              Voting
            </button>

            <button
              className={`px-6 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                activeTab === "payments"
                  ? "border-b-2 border-primary-500 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("payments")}
            >
              <FaCreditCard className="mr-2" />
              Payments
            </button>

            <button
              className={`px-6 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                activeTab === "notifications"
                  ? "border-b-2 border-primary-500 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              <FaBell className="mr-2" />
              Notifications
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
                <h2 className="text-lg font-medium flex items-center">
                  <FaGlobe className="mr-2 text-primary-500" />
                  Site Information
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) =>
                      updateSetting("general", "siteName", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) =>
                      updateSetting("general", "contactEmail", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Description
                  </label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) =>
                      updateSetting(
                        "general",
                        "siteDescription",
                        e.target.value
                      )
                    }
                    rows="3"
                    className="w-full p-2 border rounded-md"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    value={settings.general.logoUrl}
                    onChange={(e) =>
                      updateSetting("general", "logoUrl", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Voting Settings */}
          {activeTab === "voting" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
                <h2 className="text-lg font-medium flex items-center">
                  <FaTshirt className="mr-2 text-primary-500" />
                  Voting Configuration
                </h2>

                <div className="flex items-center">
                  <span className="mr-2 text-sm">Enable Voting</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.voting.votingEnabled}
                      onChange={(e) =>
                        updateSetting(
                          "voting",
                          "votingEnabled",
                          e.target.checked
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voting Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={settings.voting.votingStartDate}
                    onChange={(e) =>
                      updateSetting("voting", "votingStartDate", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voting End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={settings.voting.votingEndDate}
                    onChange={(e) =>
                      updateSetting("voting", "votingEndDate", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Per Vote (₦)
                  </label>
                  <input
                    type="number"
                    value={settings.voting.pricePerVote}
                    onChange={(e) =>
                      updateSetting(
                        "voting",
                        "pricePerVote",
                        Number(e.target.value)
                      )
                    }
                    min="0"
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Votes
                  </label>
                  <input
                    type="number"
                    value={settings.voting.minimumVotes}
                    onChange={(e) =>
                      updateSetting(
                        "voting",
                        "minimumVotes",
                        Number(e.target.value)
                      )
                    }
                    min="1"
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Votes
                  </label>
                  <input
                    type="number"
                    value={settings.voting.maximumVotes}
                    onChange={(e) =>
                      updateSetting(
                        "voting",
                        "maximumVotes",
                        Number(e.target.value)
                      )
                    }
                    min="1"
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Results Visibility
                  </label>
                  <select
                    value={settings.voting.resultsVisibility}
                    onChange={(e) =>
                      updateSetting(
                        "voting",
                        "resultsVisibility",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="admin-only">Admin Only</option>
                    <option value="after-voting">After Voting</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireAuthentication"
                    checked={settings.voting.requireAuthentication}
                    onChange={(e) =>
                      updateSetting(
                        "voting",
                        "requireAuthentication",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-primary-600 rounded border-gray-300"
                  />
                  <label
                    htmlFor="requireAuthentication"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Require Authentication
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowAnonymousVoting"
                    checked={settings.voting.allowAnonymousVoting}
                    onChange={(e) =>
                      updateSetting(
                        "voting",
                        "allowAnonymousVoting",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-primary-600 rounded border-gray-300"
                  />
                  <label
                    htmlFor="allowAnonymousVoting"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Allow Anonymous Voting
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="displayLeaderboard"
                    checked={settings.voting.displayLeaderboard}
                    onChange={(e) =>
                      updateSetting(
                        "voting",
                        "displayLeaderboard",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-primary-600 rounded border-gray-300"
                  />
                  <label
                    htmlFor="displayLeaderboard"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Display Leaderboard
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                  <FaPalette className="mr-2 text-primary-500" />
                  Shirt Color Options
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {settings.voting.shirtOptions.map((option, index) => (
                      <div
                        key={option.id}
                        className="border rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div
                              className="w-6 h-6 rounded-full mr-2"
                              style={{
                                backgroundColor: option.hex,
                                border:
                                  option.id === "white"
                                    ? "1px solid #ddd"
                                    : "none",
                              }}
                            ></div>
                            <span className="font-medium">{option.name}</span>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={option.enabled}
                              onChange={(e) =>
                                updateNestedSetting(
                                  "voting",
                                  "shirtOptions",
                                  index,
                                  "enabled",
                                  e.target.checked
                                )
                              }
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>

                        <input
                          type="text"
                          value={option.hex}
                          onChange={(e) =>
                            updateNestedSetting(
                              "voting",
                              "shirtOptions",
                              index,
                              "hex",
                              e.target.value
                            )
                          }
                          className="w-full p-1 text-sm border rounded-md mt-1"
                          placeholder="#000000"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
                <h2 className="text-lg font-medium flex items-center">
                  <FaCreditCard className="mr-2 text-primary-500" />
                  Payment Configuration
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Provider
                  </label>
                  <select
                    value={settings.payments.paymentProvider}
                    onChange={(e) =>
                      updateSetting(
                        "payments",
                        "paymentProvider",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="paystack">Paystack</option>
                    <option value="flutterwave">Flutterwave</option>
                    <option value="manual">Manual Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={settings.payments.currency}
                    onChange={(e) =>
                      updateSetting("payments", "currency", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="NGN">Nigerian Naira (₦)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>

                {settings.payments.paymentProvider === "paystack" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Paystack Public Key
                      </label>
                      <input
                        type="text"
                        value={settings.payments.paystackPublicKey}
                        onChange={(e) =>
                          updateSetting(
                            "payments",
                            "paystackPublicKey",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md"
                        placeholder="pk_test_..."
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="paystackTestMode"
                        checked={settings.payments.paystackTestMode}
                        onChange={(e) =>
                          updateSetting(
                            "payments",
                            "paystackTestMode",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-primary-600 rounded border-gray-300"
                      />
                      <label
                        htmlFor="paystackTestMode"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Use Paystack Test Mode
                      </label>
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Success Message
                  </label>
                  <textarea
                    value={settings.payments.paymentSuccessMessage}
                    onChange={(e) =>
                      updateSetting(
                        "payments",
                        "paymentSuccessMessage",
                        e.target.value
                      )
                    }
                    rows="2"
                    className="w-full p-2 border rounded-md"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Failure Message
                  </label>
                  <textarea
                    value={settings.payments.paymentFailureMessage}
                    onChange={(e) =>
                      updateSetting(
                        "payments",
                        "paymentFailureMessage",
                        e.target.value
                      )
                    }
                    rows="2"
                    className="w-full p-2 border rounded-md"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="receiptEnabled"
                    checked={settings.payments.receiptEnabled}
                    onChange={(e) =>
                      updateSetting(
                        "payments",
                        "receiptEnabled",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-primary-600 rounded border-gray-300"
                  />
                  <label
                    htmlFor="receiptEnabled"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Enable Email Receipts
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="paymentNotifications"
                    checked={settings.payments.paymentNotifications}
                    onChange={(e) =>
                      updateSetting(
                        "payments",
                        "paymentNotifications",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-primary-600 rounded border-gray-300"
                  />
                  <label
                    htmlFor="paymentNotifications"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Send Payment Notifications
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
                <h2 className="text-lg font-medium flex items-center">
                  <FaBell className="mr-2 text-primary-500" />
                  Notification Settings
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Template
                  </label>
                  <select
                    value={settings.notifications.emailTemplate}
                    onChange={(e) =>
                      updateSetting(
                        "notifications",
                        "emailTemplate",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="default">Default Template</option>
                    <option value="minimal">Minimal Template</option>
                    <option value="branded">Branded Template</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Admin Notifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adminEmailNotifications"
                      checked={settings.notifications.adminEmailNotifications}
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "adminEmailNotifications",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label
                      htmlFor="adminEmailNotifications"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Receive Email Notifications
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adminVoteNotification"
                      checked={settings.notifications.adminVoteNotification}
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "adminVoteNotification",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label
                      htmlFor="adminVoteNotification"
                      className="ml-2 text-sm text-gray-700"
                    >
                      New Vote Notifications
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adminPaymentNotification"
                      checked={settings.notifications.adminPaymentNotification}
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "adminPaymentNotification",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label
                      htmlFor="adminPaymentNotification"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Payment Notifications
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adminUserRegistrationNotification"
                      checked={
                        settings.notifications.adminUserRegistrationNotification
                      }
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "adminUserRegistrationNotification",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label
                      htmlFor="adminUserRegistrationNotification"
                      className="ml-2 text-sm text-gray-700"
                    >
                      New User Notifications
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">User Notifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="userEmailNotifications"
                      checked={settings.notifications.userEmailNotifications}
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "userEmailNotifications",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label
                      htmlFor="userEmailNotifications"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Send Email Notifications to Users
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
