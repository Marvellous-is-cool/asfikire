"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FaExclamationTriangle } from "react-icons/fa";
import { PageHeader } from "../../../components/PageHeader";
import Link from "next/link";

// Separate component that uses useSearchParams
function PaymentError() {
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState({
    message: "An unknown error occurred during payment processing.",
    reference: "",
  });

  useEffect(() => {
    const message = searchParams.get("message");
    const reference = searchParams.get("reference");

    if (message) {
      setErrorDetails({
        message,
        reference: reference || "",
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen pb-12">
      <PageHeader
        title="Payment Error"
        subtitle="There was a problem with your payment"
        imageSrc="/images/voting-header.jpg"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center">
            <div className="bg-red-100 p-4 rounded-full">
              <FaExclamationTriangle className="text-red-500 text-4xl" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-6 mb-4">Payment Failed</h2>

          <p className="text-gray-700 mb-6">{errorDetails.message}</p>

          {errorDetails.reference && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 inline-block">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Transaction Reference: </span>
                {errorDetails.reference}
              </p>
            </div>
          )}

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
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function PaymentErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pb-12">
          <PageHeader
            title="Payment Error"
            subtitle="There was a problem with your payment"
            imageSrc="/images/voting-header.jpg"
          />
          <div className="container mx-auto px-4 py-12 flex items-center justify-center">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Loading</h2>
              <p className="text-gray-600">
                Please wait while we load error details...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <PaymentError />
    </Suspense>
  );
}
