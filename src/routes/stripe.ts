import { Router } from "express";
import { createCheckoutSession } from "../handlers/stripe";
import { checkAuth } from "../middlewares/checkAuth";
const router = Router();

router.get(
  "/create-checkout-session/:courseId",
  checkAuth,
  createCheckoutSession
);

export default router;
