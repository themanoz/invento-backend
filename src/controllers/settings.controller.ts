import { type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { type AuthRequest } from "../middleware/auth.js";

export const getSettings = async (req: AuthRequest, res: Response) => {
    try {
        const orgId = req.user!.organizationId;

        const organization = await prisma.organization.findUnique({
            where: { id: orgId },
            select: {
                defaultLowStockThreshold: true,
            },
        });

        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }

        return res.json({
            success: true,
            data: {
                defaultLowStockThreshold: organization.defaultLowStockThreshold,
            },
        });
    } catch (error) {
        console.error("getSettings error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
    try {
        const orgId = req.user!.organizationId;
        const { defaultLowStockThreshold } = req.body;

        if (defaultLowStockThreshold === undefined) {
            return res.status(400).json({ error: "defaultLowStockThreshold is required" });
        }

        const updatedOrg = await prisma.organization.update({
            where: { id: orgId },
            data: {
                defaultLowStockThreshold: Number(defaultLowStockThreshold),
            },
        });

        return res.json({
            success: true,
            message: "Settings updated successfully",
            data: {
                defaultLowStockThreshold: updatedOrg.defaultLowStockThreshold,
            },
        });
    } catch (error) {
        console.error("updateSettings error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
