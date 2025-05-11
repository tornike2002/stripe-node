import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    stripeCustomerId: {
      type: String,
      required: false,
      default: null,
    },
    currentSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ stipeCustomerId: 1 }, { unique: true, sparse: true });
userSchema.index({ currentSubscriptionId: 1 }, { sparse: true });
const User = mongoose.model("User", userSchema);

export default User;
