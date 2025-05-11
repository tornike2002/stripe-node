import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../module/jwt";
import jwt, { JwtPayload } from "jsonwebtoken";
import Stripe from "../config/stripe";
import Subscription from "../models/Subscriptions";
import Purchases from "../models/Purchases";


