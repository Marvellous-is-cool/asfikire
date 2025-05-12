"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getCurrentMember } from "../lib/auth";
import ShirtThumbnail from "./ShirtThumbnail";
import { usePaystackPayment } from "react-paystack";
import { handlePayment, initiatePayment } from "../lib/payment";

export default function VotingForm({
  selectedColor,
  onSubmit,
  onBack,
  isOnBehalf,
  username = "",
  family, // Add family as a prop
}) {
  const [memberInfo, setMemberInfo] = useState(null);
  const [formData, setFormData] = useState({
    voteAmount: "",
  });
  const [errors, setErrors] = useState({});
  const [voteCount, setVoteCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadMember() {
      const member = await getCurrentMember();
      setMemberInfo(member);
    }

    loadMember();
  }, []);

  useEffect(() => {
    // Calculate vote count based on amount (100₦ per vote)
    const amount = Number(formData.voteAmount) || 0;
    setVoteCount(Math.floor(amount / 100));
  }, [formData.voteAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.voteAmount && isNaN(parseFloat(formData.voteAmount))) {
      newErrors.voteAmount = "Amount must be a number";
    } else if (Number(formData.voteAmount) < 100) {
      newErrors.voteAmount = "Minimum vote amount is ₦100 (1 vote)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsProcessing(true);
      setErrors({});

      const voteAmount = parseFloat(formData.voteAmount);
      if (isNaN(voteAmount) || voteAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Get votes count based on amount and price per vote
      const votesCount = Math.floor(voteAmount / 100);
      if (votesCount < 1) {
        throw new Error(`Minimum amount for 1 vote is ₦100`);
      }

      // Create payment details
      const paymentData = {
        amount: voteAmount * 100, // Paystack uses kobo, so multiply by 100
        email: `${username || "anonymous"}@anglican-fellowship.com`,
        metadata: {
          color: selectedColor.id,
          username: username,
          votes: votesCount,
          family: family || memberInfo?.family || "unknown", // Use provided family or fallback
        },
        callbackUrl: `${window.location.origin}/payment/callback`,
      };

      console.log("Initiating payment with data:", paymentData);

      // Show payment processing overlay
      setErrors({
        submit:
          "You will be redirected to Paystack to make your payment. Please wait and don't close this window.",
      });

      // Initiate payment
      const paymentResult = await handlePayment(paymentData);
      console.log("Payment result:", paymentResult);

      if (paymentResult.success) {
        if (paymentResult.redirected) {
          // The redirect is handled by handlePayment
          console.log("Payment redirected, waiting for callback...");
        } else {
          // Handle direct success (unlikely with Paystack)
          onSubmit({
            color: selectedColor.id,
            voteAmount,
            family: family || memberInfo?.family || "unknown",
            votesCount,
            reference: paymentResult.data?.reference,
          });
        }
      } else {
        throw new Error(paymentResult.error || "Payment initialization failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrors({ submit: err.message || "Failed to process payment" });
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Ensure black color is handled correctly in the shirt preview
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Vote Details</h2>
        <div className="flex items-center">
          <div
            className="w-6 h-6 rounded-full mr-2"
            style={{
              backgroundColor: selectedColor?.hex || "#000000",
              border: selectedColor?.id === "white" ? "1px solid #ddd" : "none",
            }}
          ></div>
          <span className="font-medium capitalize">
            {selectedColor?.name || "Color"}
          </span>
        </div>
      </div>

      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 mr-4 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
          disabled={isProcessing}
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold">Complete Your Vote</h2>
      </div>

      <div className="flex items-center mb-6 justify-center">
        <ShirtThumbnail color={selectedColor.id} size="large" />
      </div>

      <div className="flex items-center mb-6">
        <div
          className="w-12 h-12 rounded-full mr-4"
          style={{ backgroundColor: selectedColor.hex }}
        ></div>
        <div>
          <p className="text-sm text-gray-600">You selected</p>
          <p className="font-semibold">{selectedColor.name}</p>
        </div>
      </div>

      {memberInfo && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-primary-600">
          <p className="text-sm text-gray-600">
            {isOnBehalf ? "Voting on behalf of" : "Voting as"}
          </p>
          <p className="font-medium">{memberInfo.displayName || username}</p>
          <p className="text-sm text-gray-500">
            Family: {family || memberInfo.family || "Guest"}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="voteAmount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Vote Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">₦</span>
            </div>
            <input
              type="text"
              id="voteAmount"
              name="voteAmount"
              value={formData.voteAmount}
              onChange={handleChange}
              className={`input-field pl-7 ${
                errors.voteAmount ? "border-red-500 ring-red-100" : ""
              }`}
              placeholder="100"
              disabled={isProcessing}
            />
          </div>
          {errors.voteAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.voteAmount}</p>
          )}
          <div className="mt-2 bg-primary-50 p-3 rounded-lg border-l-4 border-amber-500">
            <p className="text-sm text-primary-800">
              <span className="font-medium">₦100 = 1 vote</span>. Your current
              amount will give you{" "}
              <span className="font-bold">
                {voteCount} vote{voteCount !== 1 ? "s" : ""}
              </span>
              .
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            Payment Information
          </h3>
          <p className="text-sm text-blue-700 mb-2">
            You'll be redirected to Paystack to complete your payment securely.
          </p>
          <p className="text-sm text-blue-700">
            <strong>Important:</strong> After payment, please wait for automatic
            redirection back to this site for your vote to be counted.
          </p>
        </div>

        {errors.submit && (
          <div
            className={`mb-4 p-3 rounded-lg border-l-4 ${
              errors.submit.includes("redirected")
                ? "bg-yellow-50 border-yellow-500 text-yellow-700"
                : "bg-red-50 border-red-500 text-red-600"
            }`}
          >
            <p className="text-sm">{errors.submit}</p>
          </div>
        )}

        <motion.button
          type="submit"
          className="btn-primary w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-5 w-5 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
              Processing...
            </span>
          ) : (
            "Proceed to Payment"
          )}
        </motion.button>
      </form>
    </div>
  );
}
