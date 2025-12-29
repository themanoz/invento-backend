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
    let token = req.cookies.auth_token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      console.error("No token found in cookies or Authorization header");
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
