import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../middleware/auth.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, organization } = req.body;

    if (!email || !password || !organization) {
      return res.status(409).json({ error: "not valid  credentials." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: organization,
        },
      });

      await tx.user.create({
        data: {
          email: email,
          passwordHash: passwordHash,
          organizationId: org.id,
        },
      });
    });

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
      include: { organization: true },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        organizationId: user.organizationId
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          organizationId: user.organizationId,
          organization: {
            id: user.organization.id,
            name: user.organization.name,
          },
        },
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        email: true,
        organizationId: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          organizationId: user.organizationId,
          organization: user.organization,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
