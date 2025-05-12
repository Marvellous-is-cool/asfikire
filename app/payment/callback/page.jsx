"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import { PageHeader } from "../../../components/PageHeader";
import Link from "next/link";

// Separate component that uses useSearchParams
function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const verificationInProgress = useRef(false);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");

    if (reference && !verificationInProgress.current) {
      verifyTransaction(reference);
    } else if (!reference) {
      setError("No transaction reference found");
      setIsLoading(false);
    }
  }, [searchParams]);

  // Redirect to thank-you page when verification is successful
  useEffect(() => {
    if (verificationResult && verificationResult.success) {
      // Store verification result in localStorage for the thank-you page
      localStorage.setItem(
        "transactionVerificationResult",
        JSON.stringify(verificationResult)
      );
      localStorage.setItem(
        "lastTransactionReference",
        verificationResult.data.reference
      );

      // 3-second timeout before redirecting to the thank-you page
      redirectTimeoutRef.current = setTimeout(() => {
        // Build the URL with all necessary parameters
        const params = new URLSearchParams();
        params.append("reference", verificationResult.data.reference);

        // Add other useful data
        if (verificationResult.data.amount) {
          params.append("amount", verificationResult.data.amount);
        }
        if (verificationResult.data.metadata?.color) {
          params.append("color", verificationResult.data.metadata.color);
        }
        if (verificationResult.data.metadata?.family) {
          params.append("family", verificationResult.data.metadata.family);
        }
        if (verificationResult.data.metadata?.username) {
          params.append("username", verificationResult.data.metadata.username);
        }

        // Redirect with all parameters
        router.push(`/thank-you?${params.toString()}`);
      }, 3000);
    }

    return () => {
      // Clear the timeout when component unmounts or when dependencies change
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [verificationResult, router]);

  const verifyTransaction = async (reference) => {
    // Prevent multiple verification attempts for the same reference
    if (verificationInProgress.current) {
      return;
    }

    verificationInProgress.current = true;
    setIsLoading(true);
    setError("");

    try {
      // Verify the transaction by calling our API endpoint
      const verifyResponse = await fetch("/api/payment/verify-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference,
        }),
      });

      // Handle non-200 responses
      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();

        // Retry logic for server errors (500s)
        if (verifyResponse.status >= 500 && retryCount < 2) {
          setRetryCount(retryCount + 1);
          verificationInProgress.current = false;
          setTimeout(() => verifyTransaction(reference), 2000);
          return;
        }

        throw new Error(`Payment verification failed: ${errorText}`);
      }

      const data = await verifyResponse.json();

      if (!data.success) {
        throw new Error(data.message || "Verification failed");
      }

      // Store the verification result in localStorage for the thank-you page
      localStorage.setItem(
        "transactionVerificationResult",
        JSON.stringify(data)
      );
      setVerificationResult(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to verify your payment");

      // Redirect to error page for better handling
      router.push(
        `/payment/error?message=${encodeURIComponent(
          err.message
        )}&reference=${reference}`
      );
    } finally {
      setIsLoading(false);
      // Keep verificationInProgress true to prevent further verification attempts
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <PageHeader
        title="Payment Verification"
        subtitle="Checking your payment status"
        imageSrc="/images/voting-header.jpg"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {isLoading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-primary-600 text-4xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
              <p className="text-gray-600">
                Please wait while we confirm your payment...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
              <p className="mb-6">{error}</p>
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
          ) : (
            <div className="text-center py-8">
              <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-black">
                Payment Successful!
              </h2>
              <p className="text-lg mb-6 text-gray-700">
                Thank you for your vote. Your transaction has been completed
                successfully.
              </p>

              {verificationResult && (
                <div className="bg-gray-50 p-4 rounded-lg text-left mb-8">
                  <h3 className="font-bold mb-2 text-gray-700">
                    Transaction Details:
                  </h3>
                  <p className="mb-1">
                    <span className="font-semibold">Reference:</span>{" "}
                    {verificationResult.data.reference}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Amount:</span> ₦
                    {verificationResult.data.amount?.toLocaleString()}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Status:</span>{" "}
                    <span className="text-green-600 font-medium">
                      {verificationResult.data.status}
                    </span>
                  </p>
                  {verificationResult.data.metadata?.color && (
                    <p className="mb-1">
                      <span className="font-semibold">Voted for:</span>{" "}
                      <span className="capitalize">
                        {verificationResult.data.metadata.color}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <p className="mt-4 text-primary-600">
                Redirecting to receipt page in a moment...
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Link
                  href="/"
                  className="bg-gray-800 text-white py-3 px-6 rounded-lg inline-flex items-center justify-center"
                >
                  Return Home
                </Link>
                <Link
                  href="/thank-you"
                  className="bg-primary-600 text-white py-3 px-6 rounded-lg inline-flex items-center justify-center"
                >
                  View Receipt
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
export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pb-12">
          <PageHeader
            title="Payment Verification"
            subtitle="Checking your payment status"
            imageSrc="/images/voting-header.jpg"
          />
          <div className="container mx-auto px-4 py-12 flex items-center justify-center">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Loading</h2>
              <p className="text-gray-600">
                Please wait while we process your request...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <PaymentCallback />
    </Suspense>
  );
}
