import { getCurrentMember } from "./auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Submit a vote for a color
 * @param {string} color - The color being voted for
 * @param {number} amount - The amount paid (previously voteAmount)
 * @param {string|null} onBehalfOf - If voting on behalf of someone else
 * @param {number} voteCount - Number of votes
 * @param {string} paymentReference - Payment reference to link vote to payment
 * @returns {Promise<object>} - The result of the vote submission
 */
export async function submitVote(
  color,
  amount,
  onBehalfOf = null,
  voteCount = 1,
  paymentReference = null
) {
  try {
    let voteData = {};

    // Try to get current member (for authenticated votes)
    try {
      const currentMember = await getCurrentMember();
      if (currentMember) {
        voteData = {
          memberId: currentMember.uid,
          memberName: currentMember.displayName,
          username: currentMember.username,
          family: currentMember.family,
        };

        // Check if member has already voted (only for authenticated users)
        const votesRef = collection(db, "votes");
        const memberVotesQuery = query(
          votesRef,
          where("memberId", "==", currentMember.uid)
        );
        const existingVotes = await getDocs(memberVotesQuery);

        if (!existingVotes.empty && !paymentReference) {
          throw new Error("You have already voted");
        }
      }
    } catch (authError) {
      // If no authenticated user found or authentication fails, continue as anonymous
      console.log("No authenticated user, continuing as anonymous vote");
    }

    // Complete vote data
    voteData = {
      ...voteData,
      color,
      voteAmount: Number(amount) || 0,
      voteCount: Number(voteCount) || 1,
      timestamp: serverTimestamp(),
    };

    // Add optional fields
    if (onBehalfOf) {
      voteData.onBehalfOf = onBehalfOf;
    }

    if (paymentReference) {
      voteData.paymentReference = paymentReference;
    }

    // Add the vote
    const docRef = await addDoc(collection(db, "votes"), voteData);

    // Update color stats in a separate document to track totals
    try {
      const colorStatsRef = doc(db, "stats", "colors");
      const docSnapshot = await getDoc(colorStatsRef);

      if (docSnapshot.exists()) {
        // Update existing stats
        const currentStats = docSnapshot.data();
        const colorKey = color;
        const currentVotes = currentStats[colorKey]?.votes || 0;
        const currentAmount = currentStats[colorKey]?.amount || 0;

        await updateDoc(colorStatsRef, {
          [`${colorKey}.votes`]: currentVotes + Number(voteCount),
          [`${colorKey}.amount`]: currentAmount + Number(amount),
          [`${colorKey}.transactions`]: arrayUnion({
            reference: paymentReference,
            amount: Number(amount),
            timestamp: new Date().toISOString(),
          }),
        });
      }
    } catch (statsError) {
      // Non-critical error, continue
      console.error("Failed to update color stats:", statsError);
    }

    return { id: docRef.id, ...voteData };
  } catch (error) {
    console.error("Error submitting vote:", error);
    throw error;
  }
}

// Record a failed vote for admin processing
export async function recordFailedVote(voteData) {
  try {
    const docRef = await addDoc(collection(db, "failedVotes"), {
      ...voteData,
      processedByAdmin: false,
      timeRecorded: serverTimestamp(),
    });

    return { id: docRef.id, success: true };
  } catch (error) {
    console.error("Error recording failed vote:", error);
    throw error;
  }
}

// Get all votes for admin
export async function getAllVotes() {
  try {
    const votesRef = collection(db, "votes");
    const votesQuery = query(votesRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(votesQuery);

    const votes = [];
    querySnapshot.forEach((doc) => {
      votes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return votes;
  } catch (error) {
    console.error("Error getting votes:", error);
    throw error;
  }
}

/**
 * Get voting statistics with proper calculation using price per vote
 * @param {Object} options - Options for filtering statistics
 * @param {number} options.days - Number of days to include (0 for all time)
 * @param {boolean} options.includeDetails - Whether to include detailed vote records
 * @param {string} options.username - Filter by username
 * @param {string} options.family - Filter by family
 * @param {string} options.color - Filter by color
 * @returns {Promise<Object>} The vote statistics
 */
export async function getVoteStatistics(options = {}) {
  const {
    days = 0,
    includeDetails = false,
    username = null,
    family = null,
    color = null,
  } = options;

  try {
    // Get the settings to get the price per vote
    const settingsDoc = await getDoc(doc(db, "settings", "app"));
    const settings = settingsDoc.exists()
      ? settingsDoc.data()
      : { voting: { pricePerVote: 100 } };
    const pricePerVote = settings.voting?.pricePerVote || 100;

    let votesQuery = collection(db, "votes");
    const queryFilters = [];

    // Add date filter if specified
    if (days > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      queryFilters.push(
        where("timestamp", ">=", Timestamp.fromDate(startDate))
      );
    }

    // Add username filter if specified
    if (username) {
      // Check both username and memberEmail fields
      queryFilters.push(where("username", "==", username));
      // Note: This is OR logic, which requires separate queries in Firestore
    }

    // Add family filter if specified
    if (family && family !== "all") {
      queryFilters.push(where("family", "==", family));
    }

    // Add color filter if specified
    if (color && color !== "all") {
      queryFilters.push(where("color", "==", color));
    }

    // Add ordering
    let finalQuery;
    if (queryFilters.length > 0) {
      finalQuery = query(
        votesQuery,
        ...queryFilters,
        orderBy("timestamp", "desc")
      );
    } else {
      finalQuery = query(votesQuery, orderBy("timestamp", "desc"));
    }

    // Execute query with error handling
    let votesSnapshot;
    try {
      votesSnapshot = await getDocs(finalQuery);
    } catch (error) {
      console.error("Error fetching votes:", error);
      throw new Error("Failed to fetch voting data from database");
    }

    // Initialize statistics containers
    const stats = {
      totalVotes: 0,
      totalAmount: 0,
      uniqueVoters: 0,
      colorVotes: {},
      familyVotes: {},
      familyColorVotes: {},
      recentVotes: [],
      pricePerVote,
    };

    // Process votes with error handling
    const uniqueVoters = new Set();
    let voteRecords = [];

    votesSnapshot.forEach((doc) => {
      try {
        const voteData = doc.data();
        const voteAmount = Number(voteData.voteAmount) || 0;
        // Calculate votes based on amount and price per vote
        const voteCount = Math.floor(voteAmount / pricePerVote) || 1;
        const color = voteData.color || "unknown";
        const family = voteData.family || "Guest"; // Ensure family has a fallback
        const voterId =
          voteData.voterId ||
          voteData.username ||
          voteData.memberEmail ||
          "anonymous";

        // Track unique voters
        uniqueVoters.add(voterId);

        // Color statistics - use calculated votes
        if (!stats.colorVotes[color]) {
          stats.colorVotes[color] = { votes: 0, amount: 0 };
        }
        stats.colorVotes[color].votes += voteCount;
        stats.colorVotes[color].amount += voteAmount;

        // Family statistics
        if (!stats.familyVotes[family]) {
          stats.familyVotes[family] = { votes: 0, amount: 0 };
        }
        stats.familyVotes[family].votes += voteCount;
        stats.familyVotes[family].amount += voteAmount;

        // Family-color breakdown
        if (!stats.familyColorVotes[family]) {
          stats.familyColorVotes[family] = {};
        }
        if (!stats.familyColorVotes[family][color]) {
          stats.familyColorVotes[family][color] = 0;
        }
        stats.familyColorVotes[family][color] += voteCount;

        // Add to vote records
        if (includeDetails) {
          voteRecords.push({
            id: doc.id,
            ...voteData,
            family: family, // Make sure family is included
            calculatedVotes: voteCount, // Add calculated votes for reference
            timestamp: voteData.timestamp?.toDate() || null,
          });
        }
      } catch (error) {
        console.error(`Error processing vote ${doc.id}:`, error);
        // Continue processing other votes
      }
    });

    // Calculate total votes based on individual color votes
    stats.totalVotes = Object.values(stats.colorVotes).reduce(
      (sum, data) => sum + (data.votes || 0),
      0
    );

    // Calculate total amount
    stats.totalAmount = Object.values(stats.colorVotes).reduce(
      (sum, data) => sum + (data.amount || 0),
      0
    );

    stats.uniqueVoters = uniqueVoters.size;

    // Include detailed votes if requested
    if (includeDetails) {
      stats.votes = voteRecords;
      stats.recentVotes = voteRecords.slice(0, 10);
    }

    return stats;
  } catch (error) {
    console.error("Error in getVoteStatistics:", error);
    // Return default statistics object with error flag
    return {
      error: true,
      errorMessage: error.message || "An unknown error occurred",
      totalVotes: 0,
      totalAmount: 0,
      uniqueVoters: 0,
      colorVotes: {},
      familyVotes: {},
      familyColorVotes: {},
      recentVotes: [],
      pricePerVote: 100,
    };
  }
}

/**
 * Record a new vote with validation and error handling
 * @param {Object} voteData - The vote data
 * @returns {Promise<Object>} The result of the vote operation
 */
export async function recordVote(voteData) {
  try {
    // Validate vote data
    if (!voteData.color) {
      throw new Error("Vote color is required");
    }

    if (!voteData.voteAmount || isNaN(Number(voteData.voteAmount))) {
      throw new Error("Valid vote amount is required");
    }

    // Check for reference to avoid duplicates
    if (voteData.reference) {
      // Check if this reference has already been recorded
      const existingVotes = await getDocs(
        query(
          collection(db, "votes"),
          where("reference", "==", voteData.reference)
        )
      );

      if (!existingVotes.empty) {
        return {
          success: false,
          error: "This vote has already been recorded",
          alreadyExists: true,
          details: {
            id: existingVotes.docs[0].id,
            ...existingVotes.docs[0].data(),
          },
        };
      }

      // Also check payments collection
      const existingPayments = await getDocs(
        query(
          collection(db, "payments"),
          where("reference", "==", voteData.reference)
        )
      );

      if (!existingPayments.empty) {
        const paymentData = existingPayments.docs[0].data();
        // If payment exists and is already marked as processed for voting
        if (paymentData.voteProcessed) {
          return {
            success: false,
            error: "This payment has already been processed for voting",
            alreadyExists: true,
            details: {
              id: existingPayments.docs[0].id,
              ...paymentData,
            },
          };
        }
      }
    }

    // Get price per vote from settings
    const settingsDoc = await getDoc(doc(db, "settings", "app"));
    const pricePerVote = settingsDoc.exists()
      ? settingsDoc.data().voting?.pricePerVote || 100
      : 100;

    // Calculate vote count correctly
    const amount = Number(voteData.voteAmount);
    const voteCount = Math.floor(amount / pricePerVote);

    // Add timestamp if not present
    const dataToSave = {
      ...voteData,
      timestamp: voteData.timestamp || serverTimestamp(),
      voteCount: voteCount,
      processed: true,
    };

    let result;

    await runTransaction(db, async (transaction) => {
      // Double-check within transaction
      if (voteData.reference) {
        const votesRef = query(
          collection(db, "votes"),
          where("reference", "==", voteData.reference)
        );

        const votesSnap = await getDocs(votesRef);
        if (!votesSnap.empty) {
          result = {
            success: false,
            error: "Vote already recorded during transaction",
            details: { id: votesSnap.docs[0].id },
          };
          return;
        }
      }

      // Save to Firestore
      const voteRef = await addDoc(collection(db, "votes"), dataToSave);

      // If there's a payment reference, mark it as processed for votes
      if (voteData.reference) {
        const paymentQuery = query(
          collection(db, "payments"),
          where("reference", "==", voteData.reference)
        );

        const paymentSnap = await getDocs(paymentQuery);
        if (!paymentSnap.empty) {
          const paymentRef = doc(db, "payments", paymentSnap.docs[0].id);
          transaction.update(paymentRef, {
            voteProcessed: true,
            voteId: voteRef.id,
            voteTimestamp: serverTimestamp(),
          });
        }
      }

      result = {
        success: true,
        id: voteRef.id,
        message: "Vote recorded successfully",
      };
    });

    return (
      result || {
        success: false,
        error: "Transaction didn't complete properly",
      }
    );
  } catch (error) {
    console.error("Error recording vote:", error);

    return {
      success: false,
      error: error.message || "Failed to record vote",
      details: error,
    };
  }
}
