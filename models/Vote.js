import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
  },
  color: {
    type: String,
    required: [true, "Color selection is required"],
  },
  contribution: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate votes from the same email
VoteSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model("Vote", VoteSchema);
