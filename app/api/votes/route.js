import { db } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, color, contribution } = body;

    // Validate required fields
    if (!name || !email || !color) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if this email has already voted
    const votesCollection = collection(db, "votes");
    const q = query(votesCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    // Process vote data
    const voteData = {
      name,
      email,
      color,
      contribution: contribution || 0,
      timestamp: Timestamp.now(),
    };

    if (!querySnapshot.empty) {
      // Update existing vote
      const docRef = doc(db, "votes", querySnapshot.docs[0].id);
      await updateDoc(docRef, voteData);

      return NextResponse.json({
        success: true,
        message: "Your vote has been updated!",
        data: { id: querySnapshot.docs[0].id, ...voteData },
      });
    }

    // Create new vote
    const docRef = await addDoc(votesCollection, voteData);

    return NextResponse.json({
      success: true,
      message: "Your vote has been recorded!",
      data: { id: docRef.id, ...voteData },
    });
  } catch (error) {
    console.error("Error saving vote:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all votes
    const votesCollection = collection(db, "votes");
    const querySnapshot = await getDocs(votesCollection);

    // Group votes by color
    const votesMap = {};

    querySnapshot.forEach((doc) => {
      const vote = doc.data();
      const colorId = vote.color;

      if (!votesMap[colorId]) {
        votesMap[colorId] = {
          _id: colorId,
          count: 0,
          totalContribution: 0,
          voters: [],
        };
      }

      votesMap[colorId].count += 1;
      votesMap[colorId].totalContribution += Number(vote.contribution) || 0;
      votesMap[colorId].voters.push({
        name: vote.name,
        contribution: Number(vote.contribution) || 0,
      });
    });

    // Convert map to array and sort by count
    const results = Object.values(votesMap).sort((a, b) => b.count - a.count);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
