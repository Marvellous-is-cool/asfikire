import { NextResponse } from "next/server";

// This route forwards requests to the verify-transaction endpoint for compatibility
export async function POST(request) {
  try {
    // Forward the request to the verify-transaction endpoint
    const body = await request.json();

    // Log the forwarding for debugging
    console.log(
      "Forwarding payment verification from /verify to /verify-transaction:",
      body.reference
    );

    // Make the internal request to verify-transaction
    const verifyResponse = await fetch(
      new URL("/api/payment/verify-transaction", request.url),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    // Return the response from the verify-transaction endpoint
    const data = await verifyResponse.json();
    return NextResponse.json(data, { status: verifyResponse.status });
  } catch (error) {
    console.error("Error in /api/payment/verify forwarding:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify payment",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
