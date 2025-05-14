import { Router } from "express";
import { createBillingPortalSession, createCheckoutSession } from "../handlers/stripe";
import { checkAuth } from "../middlewares/checkAuth";
const router = Router();

router.get(
  "/create-checkout-session/:courseId",
  checkAuth,
  createCheckoutSession
);
router.post(
  "/create-billing-portal-session",
  checkAuth,
  createBillingPortalSession
);

export default router;
