import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface JwtPayLoad {
  user: string;
}

export const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.userId = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
