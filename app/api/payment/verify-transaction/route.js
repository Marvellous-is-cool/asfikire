import { NextResponse } from "next/server";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  runTransaction,
  doc,
  getDoc,
  serverTimestamp,
  arrayUnion,
  setDoc,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// Use this to track in-progress verifications (in memory)
const verificationInProgress = new Map();

export async function POST(request) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Reference is required" },
        { status: 400 }
      );
    }

    // Log the reference for debugging
    console.log("Verifying transaction with reference:", reference);

    // Check if verification for this reference is already in progress
    if (verificationInProgress.get(reference)) {
      console.log(
        `Verification already in progress for reference: ${reference}`
      );
      return NextResponse.json(
        {
          success: false,
          message: "Verification already in progress",
          inProgress: true,
        },
        { status: 429 }
      );
    }

    // Mark this verification as in progress
    verificationInProgress.set(reference, true);

    try {
      // First check if we already have this transaction
      const existingPayments = await getDocs(
        query(collection(db, "payments"), where("reference", "==", reference))
      );

      if (!existingPayments.empty) {
        // Return existing payment data
        const paymentData = existingPayments.docs[0].data();
        console.log(`Payment already exists for reference: ${reference}`);
        return NextResponse.json({
          success: true,
          alreadyExists: true,
          data: {
            id: existingPayments.docs[0].id,
            ...paymentData,
          },
        });
      }

      // Add a temporary record to prevent double processing
      const pendingRef = doc(db, "pending_verifications", reference);
      await setDoc(pendingRef, {
        reference,
        timestamp: serverTimestamp(),
        status: "pending",
      });

      // Verify with Paystack
      const paystackUrl = `https://api.paystack.co/transaction/verify/${reference}`;
      const response = await fetch(paystackUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Handle HTTP errors from Paystack API
        const errorText = await response.text();
        console.error("Paystack API error:", errorText);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to verify with payment provider",
            details: errorText,
          },
          { status: response.status }
        );
      }

      const paystackData = await response.json();

      if (!paystackData.status || paystackData.data.status !== "success") {
        return NextResponse.json(
          {
            success: false,
            message: "Payment verification failed with payment provider",
            paystackData,
          },
          { status: 400 }
        );
      }

      // Payment is valid, extract data from response
      const { data } = paystackData;
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

      // Safely handle customer data to prevent undefined values
      const safeCustomer = {
        email: data.customer?.email || null,
        name: data.customer?.name || null,
        username: username || null,
        phone: data.customer?.phone || null,
      };

      // Get user's family from members collection if username exists
      let userFamily = data.metadata?.family || "Guest";
      if (username) {
        try {
          const membersQuery = query(
            collection(db, "members"),
            where("username", "==", username)
          );
          const memberSnapshot = await getDocs(membersQuery);

          if (!memberSnapshot.empty) {
            const memberData = memberSnapshot.docs[0].data();
            // Use the actual family from the member record if available
            if (memberData.family) {
              userFamily = memberData.family;
              console.log(`Found family "${userFamily}" for user ${username}`);
            }
          } else {
            console.log(`No member record found for username: ${username}`);
          }
        } catch (memberError) {
          console.error("Error fetching member data:", memberError);
          // Continue with the default family if there's an error
        }
      }

      // Use transaction to ensure atomic operations
      let paymentId;
      try {
        await runTransaction(db, async (transaction) => {
          // Double-check one more time within the transaction
          const paymentsQuery = query(
            collection(db, "payments"),
            where("reference", "==", reference)
          );
          const paymentsSnapshot = await getDocs(paymentsQuery);

          if (!paymentsSnapshot.empty) {
            paymentId = paymentsSnapshot.docs[0].id;
            return; // Already exists, just exit
          }

          // Record it in our database with all available data
          const paymentData = {
            reference,
            amount: data.amount / 100, // Convert from kobo to naira
            status: data.status,
            metadata: {
              ...data.metadata,
              family: userFamily, // Override with the correct family
            },
            customer: safeCustomer,
            username: username || null,
            paymentMethod: "paystack",
            channel: data.channel || "unknown",
            currency: data.currency || "NGN",
            timestamp: serverTimestamp(),
            source: "verification",
            processed: true,
            authorizationCode: data.authorization?.authorization_code || null,
            cardType: data.authorization?.card_type || null,
            bank: data.authorization?.bank || null,
            lastFourDigits: data.authorization?.last4 || null,
            createdAt: new Date(data.created_at || Date.now()).toISOString(),
            paidAt: data.paid_at ? new Date(data.paid_at).toISOString() : null,
            domain: data.domain || null,
            family: userFamily, // Use the correct family
          };

          // Add to payments collection
          const paymentRef = collection(db, "payments");
          const docRef = await addDoc(paymentRef, paymentData);
          paymentId = docRef.id;

          // Update color stats if this is a color vote
          if (data.metadata?.color) {
            // Get settings to determine price per vote
            const settingsDoc = await transaction.get(
              doc(db, "settings", "app")
            );
            const pricePerVote = settingsDoc.exists()
              ? settingsDoc.data().voting?.pricePerVote || 100
              : 100;

            const colorStatsRef = doc(db, "stats", "colors");
            const colorStatsDoc = await transaction.get(colorStatsRef);
            const colorKey = data.metadata.color;
            const calculatedVotes = Math.floor(
              data.amount / 100 / pricePerVote
            );
            // Use the correct family here
            const family = userFamily;

            if (colorStatsDoc.exists()) {
              const colorStats = colorStatsDoc.data();
              const currentVotes = colorStats[colorKey]?.votes || 0;
              const currentAmount = colorStats[colorKey]?.amount || 0;

              transaction.update(colorStatsRef, {
                [`${colorKey}.votes`]: currentVotes + calculatedVotes,
                [`${colorKey}.amount`]: currentAmount + data.amount / 100,
                [`${colorKey}.transactions`]: arrayUnion({
                  reference: reference,
                  amount: data.amount / 100,
                  timestamp: new Date().toISOString(),
                  email: safeCustomer.email,
                  username: username || null,
                  votes: calculatedVotes,
                  family: family, // Include family in the transaction record
                }),
                lastUpdated: serverTimestamp(),
              });
            } else {
              transaction.set(colorStatsRef, {
                [colorKey]: {
                  votes: calculatedVotes,
                  amount: data.amount / 100,
                  transactions: [
                    {
                      reference: reference,
                      amount: data.amount / 100,
                      timestamp: new Date().toISOString(),
                      email: safeCustomer.email,
                      username: username || null,
                      votes: calculatedVotes,
                      family: family, // Include family in the transaction record
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
              color: colorKey,
              family: userFamily, // Use the correct family
              username: username || null,
              memberEmail: safeCustomer.email,
              timestamp: serverTimestamp(),
              calculatedVotes: calculatedVotes,
              metadata: {
                ...data.metadata,
                family: userFamily, // Override metadata family with correct one
              },
              processed: true,
              source: "payment-verification",
            };

            const votesRef = collection(db, "votes");
            await transaction.set(doc(votesRef), voteData);
          }

          // Delete the pending verification record
          const pendingVerifyRef = doc(db, "pending_verifications", reference);
          transaction.delete(pendingVerifyRef);
        });
      } catch (transactionError) {
        console.error("Transaction error:", transactionError);
        return NextResponse.json(
          {
            success: false,
            message: "Error processing payment data",
            error: transactionError.message,
          },
          { status: 500 }
        );
      }

      // If we made it here, get the payment data to return
      const paymentDoc = await getDoc(doc(db, "payments", paymentId));

      return NextResponse.json({
        success: true,
        message: "Payment verified and recorded",
        data: {
          id: paymentId,
          ...paymentDoc.data(),
        },
      });
    } catch (error) {
      console.error("Error in verification process:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to verify transaction",
          error: error.message,
        },
        { status: 500 }
      );
    } finally {
      // Remove the in-progress flag
      verificationInProgress.delete(reference);
    }
  } catch (error) {
    console.error("Error in verify-transaction API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify transaction",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
