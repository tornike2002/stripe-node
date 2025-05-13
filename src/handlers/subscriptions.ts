import { Request, Response } from "express";
import User from "../models/User";
import Subscription from "../models/Subscriptions";

export const getUserSubscription = async (req: Request, res: Response) => {
  const userId = req.userId;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (!user.currentSubscriptionId) {
    res.status(404).json({ message: "User has no subscription" });
    return;
  }

  const subscription = await Subscription.findById(user.currentSubscriptionId);
  if (!subscription) {
    res.status(404).json({ message: "Subscription not found" });
    return;
  }

  res.status(200).json({ subscription });
};
