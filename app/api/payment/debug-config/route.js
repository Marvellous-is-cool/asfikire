import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if Paystack secret key is set
    const secretKeyStatus = process.env.PAYSTACK_SECRET_KEY ? "set" : "not-set";

    return NextResponse.json({
      secretKeyStatus,
      env: process.env.NODE_ENV || "unknown",
      publicKeyAvailable: !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
        secretKeyStatus: "error",
      },
      { status: 500 }
    );
  }
}
