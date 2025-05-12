import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  setDoc,
  runTransaction,
} from "firebase/firestore";

// This endpoint will receive webhook notifications from Paystack
export async function POST(request) {
  try {
    // Verify Paystack signature (in production, you should validate this)
    // const signature = request.headers.get('x-paystack-signature');

    const body = await request.json();
    console.log("Received webhook event:", body.event);

    // Check if this is a successful charge event
    if (body.event === "charge.success") {
      const { data } = body;
      const reference = data.reference;

      // Extract username from email or metadata
      let username = "";
      if (data.metadata?.username) {
        username = data.metadata.username;
      } else if (
        data.customer?.email &&
        data.customer.email.includes("@anglican-fellowship.com")
      ) {
        // Try to extract username from email if it uses our domain
        username = data.customer.email.split("@")[0];
      }

      console.log("Processing webhook for reference:", reference);

      // Sanitize customer data to avoid undefined values
      const safeCustomer = {
        email: data.customer?.email || null,
        name: data.customer?.name || null,
        username: username || null,
      };

      // Use a transaction to ensure atomic operations
      try {
        await runTransaction(db, async (transaction) => {
          // Check if this transaction has already been processed
          const existingPaymentsQuery = query(
            collection(db, "payments"),
            where("reference", "==", reference)
          );
          const existingPaymentsSnapshot = await getDocs(existingPaymentsQuery);

          if (!existingPaymentsSnapshot.empty) {
            console.log(`Payment already exists for reference: ${reference}`);
            return; // Early exit if payment already exists
          }

          // Create a standardized payment record
          const paymentData = {
            reference: reference,
            amount: data.amount / 100, // Convert from kobo to naira
            status: data.status,
            metadata: data.metadata || {},
            customer: safeCustomer,
            username: username || null,
            timestamp: serverTimestamp(),
            paymentMethod: "paystack",
            channel: data.channel || "unknown",
            currency: data.currency || "NGN",
            source: "webhook",
            processed: true, // Mark as processed to prevent duplicate processing
            family: data.metadata?.family || "Guest", // Store family information with fallback
          };

          // Add to payments collection for transaction history
          const paymentRef = await addDoc(
            collection(db, "payments"),
            paymentData
          );
          console.log(`Payment recorded with ID: ${paymentRef.id}`);

          // Now update color stats - only if we have a valid color
          if (data.metadata?.color) {
            const colorStatsRef = doc(db, "stats", "colors");
            const colorStatsDoc = await transaction.get(colorStatsRef);

            if (colorStatsDoc.exists()) {
              const colorStats = colorStatsDoc.data();
              const colorKey = data.metadata.color;
              const currentVotes = colorStats[colorKey]?.votes || 0;
              const currentAmount = colorStats[colorKey]?.amount || 0;
              const family = data.metadata?.family || "Guest"; // Ensure family has a fallback

              // Calculate votes based on amount and price per vote
              // Get price per vote from settings or use default of 100
              const settingsDoc = await transaction.get(
                doc(db, "settings", "app")
              );
              const pricePerVote = settingsDoc.exists()
                ? settingsDoc.data().voting?.pricePerVote || 100
                : 100;

              const newVotes = Math.floor(data.amount / 100 / pricePerVote);

              transaction.update(colorStatsRef, {
                [`${colorKey}.votes`]: currentVotes + newVotes,
                [`${colorKey}.amount`]: currentAmount + data.amount / 100,
                [`${colorKey}.transactions`]: arrayUnion({
                  reference: reference,
                  amount: data.amount / 100,
                  timestamp: new Date().toISOString(),
                  email: safeCustomer.email,
                  username: username || null,
                  votes: newVotes,
                  family: family, // Include family in the transaction
                }),
                lastUpdated: serverTimestamp(),
              });
            } else {
              // Create new stats document
              const pricePerVote = 100; // Default if no settings
              const newVotes = Math.floor(data.amount / 100 / pricePerVote);
              const family = data.metadata?.family || "unknown";

              transaction.set(colorStatsRef, {
                [data.metadata.color]: {
                  votes: newVotes,
                  amount: data.amount / 100,
                  transactions: [
                    {
                      reference: reference,
                      amount: data.amount / 100,
                      timestamp: new Date().toISOString(),
                      email: safeCustomer.email,
                      username: username || null,
                      votes: newVotes,
                      family: family, // Include family in the transaction
                    },
                  ],
                },
                lastUpdated: serverTimestamp(),
              });
            }

            // Also record this vote in the votes collection
            const voteData = {
              reference: reference,
              voteAmount: data.amount / 100,
              color: data.metadata.color,
              family: data.metadata?.family || "Guest", // Include family with fallback
              username: username || null,
              memberEmail: safeCustomer.email,
              timestamp: serverTimestamp(),
              calculatedVotes: Math.floor(data.amount / 100 / pricePerVote),
              metadata: data.metadata,
              processed: true,
              source: "webhook",
            };

            await addDoc(collection(db, "votes"), voteData);
          }

          // Record the webhook event for audit purposes
          await addDoc(collection(db, "payment_webhooks"), {
            reference: reference,
            event: body.event,
            timestamp: serverTimestamp(),
            rawData: JSON.stringify(body), // Convert to string to avoid undefined value issues
            processed: true,
          });
        });

        return NextResponse.json({
          success: true,
          message: "Payment processed",
        });
      } catch (transactionError) {
        console.error("Transaction error:", transactionError);
        return NextResponse.json(
          {
            success: false,
            message: "Transaction error",
            error: transactionError.message,
            reference: reference,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
