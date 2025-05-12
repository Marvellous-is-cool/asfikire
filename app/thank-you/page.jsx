"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "../../components/PageHeader";
import Link from "next/link";
import ThankYouCard from "../../components/ThankYouCard";
import ReactConfetti from "react-confetti";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { useSettings } from "../../contexts/SettingsContext";

// Separate component that uses useSearchParams
function ThankYouContent() {
  const searchParams = useSearchParams();
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [confettiActive, setConfettiActive] = useState(false);
  const { getEnabledColors } = useSettings();

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

  useEffect(() => {
    // Try to get transaction details from URL params or localStorage
    const reference = searchParams.get("reference");
    const color = searchParams.get("color");
    const amount = searchParams.get("amount");
    const family = searchParams.get("family");
    const username = searchParams.get("username");

    // Try to get stored verification result
    const savedVerification = localStorage.getItem(
      "transactionVerificationResult"
    );

    if (savedVerification) {
      try {
        const verificationData = JSON.parse(savedVerification);
        if (verificationData.success && verificationData.data) {
          setTransactionDetails(verificationData.data);
          setLoading(false);
          setConfettiActive(true);
          return;
        }
      } catch (err) {
        // Continue if parsing fails
      }
    }

    // If we have sufficient URL params, construct details without API call
    if (reference && color && amount) {
      const constructedDetails = {
        reference,
        amount: Number(amount),
        status: "success",
        metadata: {
          color,
          family: family || "Guest",
          username: username || "Anonymous",
        },
        voteCount: Math.floor(Number(amount) / 100), // Assuming ₦100 per vote
      };

      setTransactionDetails(constructedDetails);
      setLoading(false);
      setConfettiActive(true);
      return;
    }

    // If we have a reference but missing other details, fetch from API
    if (reference) {
      fetchTransactionDetails(reference);
    } else {
      setError(
        "Transaction reference not found. Please check your payment confirmation email or contact support."
      );
      setLoading(false);
    }
  }, [searchParams, getEnabledColors]);

  const fetchTransactionDetails = async (reference) => {
    try {
      const response = await fetch("/api/payment/verify-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      if (data.success) {
        setTransactionDetails(data.data);
        // Calculate vote count based on amount and price per vote (assume ₦100 per vote)
        const voteCount = Math.floor(data.data.amount / 100);
        setTransactionDetails((prev) => ({
          ...prev,
          voteCount: voteCount,
        }));
        setConfettiActive(true);
      } else {
        throw new Error(data.message || "Verification failed.");
      }
    } catch (err) {
      setError(err.message || "Failed to verify transaction.");
    } finally {
      setLoading(false);
    }
  };

  // Find the color object that matches the selected color
  const getSelectedColorObject = () => {
    if (!transactionDetails?.metadata?.color) return null;

    const enabledColors = getEnabledColors();
    return (
      enabledColors.find((c) => c.id === transactionDetails.metadata.color) || {
        id: transactionDetails.metadata.color,
        name:
          transactionDetails.metadata.color.charAt(0).toUpperCase() +
          transactionDetails.metadata.color.slice(1),
        hex:
          transactionDetails.metadata.color === "black"
            ? "#000000"
            : transactionDetails.metadata.color === "white"
            ? "#FFFFFF"
            : transactionDetails.metadata.color === "wine"
            ? "#722F37"
            : "#000000",
      }
    );
  };

  const selectedColor = getSelectedColorObject();
  const voteCount =
    transactionDetails?.voteCount ||
    Math.floor((transactionDetails?.amount || 0) / 100);

  return (
    <div className="min-h-screen pb-12">
      {/* Show confetti when transaction is verified */}
      {confettiActive && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.1}
          colors={["#1642d8", "#722F37", "#ffd166", "#ffffff"]}
          tweenDuration={8000}
          onConfettiComplete={() => setConfettiActive(false)}
        />
      )}

      <PageHeader
        title="Thank You!"
        subtitle="Your vote has been successfully recorded."
        imageSrc="/images/voting-header.jpg"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <FaSpinner className="animate-spin text-primary-600 text-4xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Retrieving Your Receipt
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your payment information...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-red-600">
              <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
              <p className="mb-6">{error}</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Link
                  href="/"
                  className="bg-gray-800 text-white py-3 px-6 rounded-lg inline-flex items-center justify-center"
                >
                  Return Home
                </Link>
                <Link
                  href="/vote"
                  className="bg-primary-600 text-white py-3 px-6 rounded-lg inline-flex items-center justify-center"
                >
                  Try Again
                </Link>
              </div>
            </div>
          ) : transactionDetails ? (
            <ThankYouCard
              selectedColor={selectedColor}
              voteCount={voteCount}
              reference={transactionDetails.reference}
              amount={transactionDetails.amount}
              username={transactionDetails.metadata?.username}
              family={transactionDetails.metadata?.family}
              status="success"
              showConfetti={false} // We're already showing confetti at the page level
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-red-600">
              <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Transaction Found</h2>
              <p className="mb-6">We couldn't find your transaction details.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="bg-gray-800 text-white py-3 px-6 rounded-lg inline-flex items-center justify-center"
                >
                  Return Home
                </Link>
                <Link
                  href="/vote"
                  className="bg-primary-600 text-white py-3 px-6 rounded-lg inline-flex items-center justify-center"
                >
                  Try Again
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pb-12">
          <PageHeader
            title="Thank You"
            subtitle="Processing your payment information"
            imageSrc="/images/voting-header.jpg"
          />
          <div className="container mx-auto px-4 py-12 flex items-center justify-center">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Loading Receipt</h2>
              <p className="text-gray-600">
                Please wait while we prepare your transaction details...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
