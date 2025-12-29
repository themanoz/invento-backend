import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, organizationName } = await req.body;

    if (!email || !password || !organizationName) {
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
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      await tx.user.create({
        data: {
          email: email,
          passwordHash: passwordHash,
          organizationId: organization.id,
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
    const { email, password } = await req.body;

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
        error: "Invalid password",
      });
    }

    const token = jwt.sign(
      { userId: user.id, orgId: user.organizationId },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
