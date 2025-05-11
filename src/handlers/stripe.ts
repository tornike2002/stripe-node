import { Request, Response } from "express";
import User from "../models/User";
import stripe from "../config/stripe";
import Course from "../models/Courses";

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { userId } = req;

  const currentUser = await User.findById(userId);

  //   TODO: add rate limiting for spamming checkout page

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
