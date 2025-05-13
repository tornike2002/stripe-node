import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ stripeSubscriptionId: 1 }, { unique: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
