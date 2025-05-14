import { Request, Response } from "express";
import User from "../models/User";
import stripe from "../config/stripe";
import Course from "../models/Courses";
import rateLimit from "../module/ratelimit";
export const createCheckoutSession = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { userId } = req;

  const currentUser = await User.findById(userId);

  const rateLimitKey = `checkout-rate-limit:${userId}`;
  const { success } = await rateLimit.limit(rateLimitKey);

  if (!success) {
    throw new Error("Too many requests stop!");
  }

  const course = await Course.findById(courseId);

  if (!course) {
    res.status(404).json({ message: "Course not found" });
    return;
  }

  if (!currentUser!.stripeCustomerId) {
    return;
  }

  const session = await stripe.checkout.sessions.create({
    customer: currentUser!.stripeCustomerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            images: [course.image],
          },
          unit_amount: Math.round(Number(course.price) * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/course/${courseId}?success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/courses`,
    metadata: {
      courseId,
      userId: currentUser!._id.toString(),
    },
  });

  res.status(200).json({ checkoutUrl: session.url });
};

export const createProPlanCheckoutSession = async (
  req: Request,
  res: Response
) => {
  const { planId } = req.params as { planId: "month" | "year" };
  const { userId } = req;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const currentUser = await User.findById(userId);

  if (!currentUser) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const rateLimitKey = `pro-plan-checkout-rate-limit:${userId}`;
  const { success } = await rateLimit.limit(rateLimitKey);

  if (!success) {
    throw new Error("Too many requests stop!");
  }

  let priceId;
  if (planId === "month") {
    priceId = process.env.STRIPE_MONTHLY_PLAN_ID;
  } else if (planId === "year") {
    priceId = process.env.STRIPE_YEARLY_PLAN_ID;
  } else {
    res.status(400).json({ message: "Invalid plan id" });
    return;
  }
  if (!priceId) {
    res.status(400).json({ message: "Price id not found" });
    return;
  }

  const session = await stripe.checkout.sessions.create({
    customer: currentUser.stripeCustomerId as string,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${
      process.env.FRONTEND_URL
    }/pro-plan?success?session_id={CHECKOUT_SESSION_ID}&year=${
      planId === "year" ? "true" : "false"
    }`,
    cancel_url: `${process.env.FRONTEND_URL}/pro-plan`,
    metadata: {
      userId: currentUser._id.toString(),
      planId,
    },
  });

  res.status(200).json({ checkoutUrl: session.url });
};

export const createBillingPortalSession = async (
  req: Request,
  res: Response
) => {
  const { userId } = req;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const currentUser = await User.findById(userId);
    if (!currentUser || !currentUser.stripeCustomerId) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: currentUser.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/billing`,
    });

    res.status(200).json({ billingUrl: session.url });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
