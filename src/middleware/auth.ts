import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Cookies received:", req.cookies);

    const token = req.cookies.auth_token;

    if (!token) {
      console.log("No auth_token cookie found");
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      organizationId: string;
    };

    req.user = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
    };

    next();
  } catch (error) {
    console.error("authMiddleware error", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
