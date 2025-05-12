import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, email, metadata, callback_url, currency = "NGN" } = body;

    if (!amount || !email) {
      return NextResponse.json(
        { success: false, message: "Amount and email are required" },
        { status: 400 }
      );
    }

    console.log("Payment initialization request:", {
      amount,
      email,
      metadata,
      callback_url,
    });

    // Get Paystack key from settings or env
    const settingsDoc = await getDoc(doc(db, "settings", "app"));
    const settings = settingsDoc.exists() ? settingsDoc.data() : null;

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const testMode = settings?.payments?.paystackTestMode || true;

    if (!paystackSecretKey) {
      console.error("Paystack secret key not configured");
      return NextResponse.json(
        { success: false, message: "Payment provider not properly configured" },
        { status: 500 }
      );
    }

    // Prepare payload for Paystack
    const paymentPayload = {
      amount: Math.floor(amount), // Ensure it's an integer
      email,
      metadata,
      callback_url,
      currency,
    };

    console.log("Sending to Paystack:", paymentPayload);

    // Call Paystack API
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      }
    );

    // Log the raw response for debugging
    const responseText = await response.text();
    console.log("Raw Paystack response:", responseText);

    // Parse the response as JSON
    let paystackData;
    try {
      paystackData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Paystack response:", e);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from payment provider",
          raw: responseText,
        },
        { status: 500 }
      );
    }

    if (!paystackData.status) {
      console.error("Paystack error:", paystackData);
      return NextResponse.json(
        {
          success: false,
          message: paystackData.message || "Payment initialization failed",
          errors: paystackData.errors || [],
        },
        { status: 400 }
      );
    }

    // Return success with Paystack authorization URL and reference
    return NextResponse.json({
      success: true,
      message: "Payment initialized successfully",
      data: {
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        access_code: paystackData.data.access_code,
      },
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to initialize payment: " + (error.message || "Unknown error"),
        details:
          process.env.NODE_ENV !== "production" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
