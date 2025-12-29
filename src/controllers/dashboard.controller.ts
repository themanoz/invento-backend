import { type Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthRequest } from "../middleware/auth.js";

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const orgId = req.user!.organizationId;

        const totalProducts = await prisma.product.count({
            where: { organizationId: orgId },
        });

        const totalStock = await prisma.product.aggregate({
            where: { organizationId: orgId },
            _sum: {
                quantityOnHand: true,
            },
        });

        const organization = await prisma.organization.findUnique({
            where: { id: orgId },
            select: { defaultLowStockThreshold: true },
        });

        const defaultThreshold = organization?.defaultLowStockThreshold ?? 5;

        const products = await prisma.product.findMany({
            where: {
                organizationId: orgId,
            },
        });

        const lowStockItems = products.filter((p) => {
            const threshold = p.lowStockThreshold ?? defaultThreshold;
            return p.quantityOnHand <= threshold;
        });

        return res.json({
            success: true,
            data: {
                totalProducts,
                totalStock: totalStock._sum.quantityOnHand || 0,
                lowStockItems: lowStockItems.slice(0, 5),
            },
        });
    } catch (error) {
        console.error("getDashboardStats error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
