import { getAuth } from "firebase/auth";
import { autoAuthenticateMember } from "./auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Initializes a payment with the appropriate provider
 * @param {Object} paymentData Payment details
 * @returns {Promise<Object>} Response from payment provider
 */
export async function initiatePayment(paymentData) {
  try {
    // Get payment provider details from settings
    const settingsDoc = await getDoc(doc(db, "settings", "app"));
    const settings = settingsDoc.exists() ? settingsDoc.data() : null;

    const provider = settings?.payments?.paymentProvider || "paystack";
    const publicKey =
      settings?.payments?.paystackPublicKey ||
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    // Validate minimum required data
    if (!paymentData.amount) {
      throw new Error("Payment amount is required");
    }

    if (!paymentData.email) {
      throw new Error("Customer email is required");
    }

    // Add debug info for development
    if (process.env.NODE_ENV !== "production") {
      console.log("Initiating payment with:", {
        provider,
        amount: paymentData.amount,
        email: paymentData.email,
      });
    }

    // Determine callback URL - default to auto-detected path if not provided
    const callbackUrl =
      paymentData.callbackUrl ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/payment/callback`
        : "/payment/callback");

    // Standardize the payload
    const payload = {
      amount: paymentData.amount,
      email: paymentData.email,
      metadata: paymentData.metadata || {},
      callback_url: callbackUrl,
      currency: settings?.payments?.currency || "NGN",
    };

    // Add additional debugging info
    console.log("Payment payload:", JSON.stringify(payload));
    console.log("Using callback URL:", callbackUrl);

    // Send request to our API endpoint
    const response = await fetch("/api/payment/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Try to get more detailed error
      const errorText = await response.text();
      console.error("Payment initialization error:", errorText);

      throw new Error(
        `Payment initialization failed with status ${response.status}: ${
          errorText || "Unknown error"
        }`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Payment initialization failed");
    }

    return data;
  } catch (error) {
    console.error("Payment initiation error:", error);
    throw error;
  }
}

/**
 * Verifies a payment transaction
 * @param {string} reference Payment reference to verify
 * @returns {Promise<Object>} Verification result
 */
export async function verifyPayment(reference) {
  if (!reference) {
    throw new Error("Payment reference is required");
  }

  try {
    // Clean the reference (remove any whitespace or unwanted characters)
    const cleanReference = reference.trim();

    console.log("Verifying payment with reference:", cleanReference);

    // Use the verify-transaction endpoint directly to avoid redirection
    const response = await fetch("/api/payment/verify-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reference: cleanReference }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Payment verification error:", errorText);

      throw new Error(
        `Payment verification failed with status ${response.status}: ${
          errorText || "Unknown error"
        }`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Payment verification failed");
    }

    return data;
  } catch (error) {
    console.error("Payment verification error:", error);
    throw error;
  }
}

/**
 * Handles payments, with robust error handling and direct redirect
 * @param {Object} paymentDetails Payment details
 * @param {Object} options Additional options
 * @returns {Promise<Object>} Payment result
 */
export async function handlePayment(paymentDetails, options = {}) {
  try {
    console.log("Starting payment process with details:", paymentDetails);

    // Initialize the payment
    const initResult = await initiatePayment(paymentDetails);
    console.log("Payment initialized successfully:", initResult);

    // IMPORTANT: For redirect-based flows (like Paystack), immediately redirect
    if (initResult.data?.authorization_url) {
      console.log(
        "Redirecting to payment page:",
        initResult.data.authorization_url
      );

      // Show the overlay before redirecting to Paystack
      showRedirectOverlay();

      // Force redirect to Paystack
      window.location.href = initResult.data.authorization_url;
      return {
        success: true,
        redirected: true,
        reference: initResult.data.reference,
        message: "Redirecting to payment provider...",
      };
    }

    return initResult;
  } catch (error) {
    console.error("Payment handling error:", error);

    // Provide detailed error information
    return {
      success: false,
      error: error.message || "Payment processing failed",
      details: error,
      code: error.code || "PAYMENT_ERROR",
    };
  }
}

// Record successful transaction in Firestore
export async function recordTransaction(transactionData) {
  try {
    const { db } = await import("./firebase");
    const { collection, addDoc, getDocs, query, where } = await import(
      "firebase/firestore"
    );

    // Extract username from email or metadata for consistent tracking
    let username = "";

    if (transactionData.metadata?.username) {
      username = transactionData.metadata.username;
    } else if (
      transactionData.customer?.email &&
      transactionData.customer.email.includes("@anglican-fellowship.com")
    ) {
      // Try to extract username from email if it uses our domain
      username = transactionData.customer.email.split("@")[0];
    }

    // Add the username to transaction data
    const enhancedData = {
      ...transactionData,
      username,
      customer: {
        ...transactionData.customer,
        username,
      },
    };

    // Check if transaction already exists to prevent duplicates
    const existingTransactions = await getDocs(
      query(
        collection(db, "payments"),
        where("reference", "==", transactionData.reference)
      )
    );

    if (!existingTransactions.empty) {
      console.log("Transaction already recorded, skipping.");
      return existingTransactions.docs[0].id;
    }

    // Add transaction to payments collection
    const docRef = await addDoc(collection(db, "payments"), {
      ...enhancedData,
      recordedAt: new Date(),
      source: enhancedData.source || "callback", // To identify this came from payment callback
    });

    console.log("Transaction recorded in payments collection:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error recording transaction:", error);
    throw error;
  }
}

// Show an overlay that informs users to wait for redirect
function showRedirectOverlay() {
  // Create overlay if it doesn't exist
  if (!document.getElementById("payment-redirect-overlay")) {
    const overlay = document.createElement("div");
    overlay.id = "payment-redirect-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";
    overlay.style.color = "white";
    overlay.style.fontFamily = "Arial, sans-serif";
    overlay.style.textAlign = "center";
    overlay.style.padding = "20px";

    const spinner = document.createElement("div");
    spinner.classList.add("payment-spinner");
    spinner.style.border = "4px solid rgba(255, 255, 255, 0.3)";
    spinner.style.borderRadius = "50%";
    spinner.style.borderTop = "4px solid white";
    spinner.style.width = "50px";
    spinner.style.height = "50px";
    spinner.style.animation = "spin 1s linear infinite";
    overlay.appendChild(spinner);

    const message = document.createElement("p");
    message.id = "payment-redirect-message";
    message.textContent = "Preparing payment page...";
    message.style.marginTop = "20px";
    message.style.fontSize = "18px";
    overlay.appendChild(message);

    const note = document.createElement("p");
    note.textContent =
      "Please do not close this window or refresh during payment.";
    note.style.marginTop = "10px";
    note.style.fontSize = "14px";
    note.style.opacity = "0.8";
    overlay.appendChild(note);

    // Add keyframe animation for spinner
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(overlay);
  } else {
    document.getElementById("payment-redirect-overlay").style.display = "flex";
  }
}

// Update the redirect overlay message
function updateRedirectOverlay(message) {
  const messageEl = document.getElementById("payment-redirect-message");
  if (messageEl) {
    messageEl.textContent = message;
  }
}

// Hide the redirect overlay
function hideRedirectOverlay() {
  const overlay = document.getElementById("payment-redirect-overlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}
