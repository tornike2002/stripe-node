import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../module/jwt";
import jwt, { JwtPayload } from "jsonwebtoken";
import stripe from "../config/stripe";
import Subscription from "../models/Subscriptions";
import Purchases from "../models/Purchases";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, stripeCustomerId = null } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      stripeCustomerId,
    });

    const token = generateToken(user._id.toString());

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const customerStripe = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });

    await User.findByIdAndUpdate(user._id, {
      stripeCustomerId: customerStripe.id,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user._id.toString());

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
    return;
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded._userId);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    res.status(200).json({
      userId: user._id,
      message: "User fetched successfully",
    });
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  try {
    res.status(200).json({
      id: user._id,
      message: "User fetched successfully",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        stripeCustomerId: user.stripeCustomerId,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getUserByStripeCustomerId = async (
  req: Request,
  res: Response
) => {
  const { stripeCustomerId } = req.params;
  try {
    const user = await User.findOne({ stripeCustomerId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({
      userId: user._id,
      message: "User fetched successfully",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        stripeCustomerId: user.stripeCustomerId,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const checkuserAccess = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const courseId = req.query.courseId as string;
  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    let hasAccess = false;

    if (user.currentSubscriptionId) {
      const subscription = await Subscription.findById(
        user.currentSubscriptionId
      );
      if (subscription && subscription.status === "active") {
        hasAccess = true;
      }
      res.status(200).json({
        message: "User has access to the course",
        hasAccess,
        accessType: "subscription",
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
      return;
    }
    const purchase = await Purchases.findOne({
      userId: user._id,
      courseId: courseId,
    });
    if (purchase) {
      hasAccess = true;
      res.status(200).json({
        message: "User has access to the course",
        hasAccess,
        accessType: "course",
      });
      return;
    }
    res.status(200).json({
      message: "User does not have access to the course",
      hasAccess,
      accessType: "none",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
