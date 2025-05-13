import { Router } from "express";
import { getUserSubscription } from "../handlers/subscriptions";
import { checkAuth } from "../middlewares/checkAuth";

const router = Router();

router.get("/", checkAuth, getUserSubscription);

export default router;
