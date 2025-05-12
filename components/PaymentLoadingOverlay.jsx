"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

export default function PaymentLoadingOverlay({
  isVisible,
  message = "Preparing payment page...",
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4"
    >
      <div className="bg-white bg-opacity-15 p-8 rounded-xl text-center backdrop-blur-md max-w-md w-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="mx-auto mb-4"
        >
          <FaSpinner className="text-5xl text-white" />
        </motion.div>

        <h2 className="text-2xl text-white font-bold mb-4">{message}</h2>

        <p className="text-white text-opacity-90 mb-6">
          Please do not close this window or refresh during payment.
        </p>

        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-white text-sm">
          <p className="mb-1">
            You will be redirected to the payment provider to complete your
            transaction.
          </p>
          <p>
            After payment is complete, you will be automatically redirected back
            to this site.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
