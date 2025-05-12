"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../contexts/SettingsContext";
import { FaCalendarAlt, FaClock, FaInfoCircle, FaLock } from "react-icons/fa";
import Link from "next/link";

export function VotingStatusBanner() {
  const { settings, isVotingEnabled } = useSettings();
  const [timeLeft, setTimeLeft] = useState(null);
  const [votingActive, setVotingActive] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Determine if voting is currently active
    const votingEnabled = isVotingEnabled();
    setVotingActive(votingEnabled);

    // Calculate time remaining if there's an end date
    if (settings.voting.votingEndDate) {
      const endDate = new Date(settings.voting.votingEndDate);
      const now = new Date();

      if (endDate > now) {
        const updateTimeLeft = () => {
          const now = new Date();
          const diffTime = endDate - now;

          // Time's up
          if (diffTime <= 0) {
            setTimeLeft(null);
            setVotingActive(false);
            return;
          }

          // Calculate days, hours, minutes
          const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (diffTime % (1000 * 60 * 60)) / (1000 * 60)
          );

          setTimeLeft({ days, hours, minutes });
        };

        // Initial update
        updateTimeLeft();

        // Set an interval to update every minute
        const interval = setInterval(updateTimeLeft, 60000);
        return () => clearInterval(interval);
      }
    }
  }, [settings.voting.votingEndDate, isVotingEnabled]);

  // Don't render if dismissed or if voting status is still loading
  if (dismissed || votingActive === null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-20 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between ${
          votingActive
            ? "bg-green-100 border-b border-green-200"
            : "bg-amber-100 border-b border-amber-200"
        }`}
      >
        <div className="flex items-center">
          {votingActive ? (
            <>
              <FaCalendarAlt className="text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                Voting is now open!
              </span>

              {timeLeft && (
                <span className="ml-2 text-green-700 flex items-center">
                  <FaClock className="mr-1" />
                  {timeLeft.days > 0 && `${timeLeft.days}d `}
                  {timeLeft.hours > 0 && `${timeLeft.hours}h `}
                  {`${timeLeft.minutes}m remaining`}
                </span>
              )}
            </>
          ) : (
            <>
              <FaLock className="text-amber-600 mr-2" />
              <span className="text-amber-800 font-medium">
                Voting is currently closed
              </span>

              {settings.voting.votingStartDate &&
                new Date(settings.voting.votingStartDate) > new Date() && (
                  <span className="ml-2 text-amber-700">
                    <FaInfoCircle className="inline mr-1" />
                    Opens on{" "}
                    {new Date(
                      settings.voting.votingStartDate
                    ).toLocaleDateString()}
                  </span>
                )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {votingActive && (
            <Link
              href="/vote"
              className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
            >
              Vote Now
            </Link>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
