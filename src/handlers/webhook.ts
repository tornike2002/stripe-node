import { Request, Response } from "express";
import Stripe from "stripe";
import stripe from "../config/stripe";
import User from "../models/User";
import Purchase from "../models/Purchases";
import Subscription from "../models/Subscriptions";

export const stripeWebhook = async (req: Request, res: Response) => {
  const body = req.body;
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  async function handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session
  ) {
    const courseId = session.metadata?.courseId;
    const stripeCustomerId = session.customer as string;

    if (!courseId || !stripeCustomerId) {
      throw new Error("Missing courseId or stripeCustomerId");
    }

    const user = await User.findOne({ stripeCustomerId });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const purchase = await Purchase.create({
      userId: user._id,
      courseId,
      purchasedAt: new Date(),
      amount: session.amount_total,
      stripePurchaseId: session.id,
    });

    if (!purchase) {
      res.status(500).json({ message: "Failed to create purchase" });
      return;
    }

    res.status(200).json({ message: "Purchase created successfully" });
    return;
  }

  async function handleSubscriptionUpsert(
    subscription: Stripe.Subscription,
    eventType: string
  ) {
    const stripeCustomerId = subscription.customer as string;
    const user = await User.findOne({ stripeCustomerId });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    try {
      const subscriptionDoc = await Subscription.findOneAndUpdate(
        { userId: user._id, stripeSubscriptionId: subscription.id },
        {
          $set: {
            status: subscription.status,
            planType: subscription.items.data[0].plan.interval as
              | "monthly"
              | "yearly",
            currentPeriodStart: subscription.trial_start,
            currentPeriodEnd: subscription.trial_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
      await User.findOneAndUpdate(user._id, {
        $set: {
          currentSubscriptionId: subscriptionDoc._id,
        },
      });
      res.status(200).json({ message: "Subscription upserted successfully" });
    } catch (error) {
      console.error(`Error handling subscription upsert ${eventType}`, error);
      res.status(500).json({ message: "Error handling subscription upsert" });
      return;
    }
  }

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error}`);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpsert(
          event.data.object as Stripe.Subscription,
          event.type
        );
        break;
      default:
        throw new Error(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    res.status(400).send(`Webhook error: ${error}`);
    return;
  }
  res.status(200).send("Webhook processed successfully");
};
