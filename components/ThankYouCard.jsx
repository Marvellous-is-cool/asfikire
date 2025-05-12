import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import Link from "next/link";
import {
  FaCheckCircle,
  FaTshirt,
  FaUser,
  FaUsers,
  FaMoneyBill,
  FaReceipt,
} from "react-icons/fa";

export default function ThankYouCard({
  selectedColor,
  voteCount = 1,
  reference,
  amount,
  username = "Anonymous",
  family = "Guest",
  status = "success",
  showConfetti = true,
}) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isConfettiActive, setIsConfettiActive] = useState(showConfetti);

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    // Update on resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Format amount as currency
  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount || 0);

  // Get color information with fallbacks
  const colorName = selectedColor?.name || reference?.color || "Unknown";
  const colorHex = selectedColor?.hex || "#000000";

  return (
    <div className="relative">
      {/* Confetti overlay */}
      {isConfettiActive && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.1}
          colors={["#1642d8", "#722F37", "#ffd166", "#ffffff"]}
          tweenDuration={8000}
          onConfettiComplete={() => setIsConfettiActive(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Success header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-center text-white">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mx-auto bg-white text-green-500 h-20 w-20 rounded-full flex items-center justify-center mb-4"
          >
            <FaCheckCircle className="h-12 w-12" />
          </motion.div>

          <h2 className="text-3xl font-bold mb-2">Thank You!</h2>
          <p className="text-blue-100">
            Your vote has been successfully recorded
          </p>
        </div>

        {/* Transaction details */}
        <div className="p-6">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Vote Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Color Selection */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div
                  className="flex-shrink-0 h-10 w-10 rounded-full mr-3 border border-gray-200"
                  style={{ backgroundColor: colorHex }}
                ></div>
                <div>
                  <p className="text-sm text-gray-500">Selected Color</p>
                  <p className="font-medium">{colorName}</p>
                </div>
              </div>

              {/* Vote Count */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full mr-3 flex items-center justify-center">
                  <FaTshirt className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Number of Votes</p>
                  <p className="font-medium">{voteCount}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full mr-3 flex items-center justify-center">
                  <FaMoneyBill className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount Paid</p>
                  <p className="font-medium">{formattedAmount}</p>
                </div>
              </div>

              {/* Transaction Reference */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full mr-3 flex items-center justify-center">
                  <FaReceipt className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reference</p>
                  <p className="font-medium text-xs truncate max-w-[150px]">
                    {reference}
                  </p>
                </div>
              </div>

              {/* Username */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full mr-3 flex items-center justify-center">
                  <FaUser className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{username || "Anonymous"}</p>
                </div>
              </div>

              {/* Family */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 bg-pink-100 rounded-full mr-3 flex items-center justify-center">
                  <FaUsers className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Family</p>
                  <p className="font-medium">{family || "Guest"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Thank you for participating in our shirt color selection process.
              Your vote has been counted and will help us decide on our
              fellowship shirt color.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-gray-800 text-white py-3 px-6 rounded-lg inline-flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                Return Home
              </Link>
              <Link
                href="/vote"
                className="bg-primary-600 text-white py-3 px-6 rounded-lg inline-flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                Vote Again
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
