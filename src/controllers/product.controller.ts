import { type Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

export const listProducts = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    const products = await prisma.product.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ products });
  } catch (error) {
    console.error("listProducts error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      name,
      sku,
      quantity = 0,
      cost_price,
      selling_price,
      lowStockThreshold,
    } = req.body || {};

    if (!name || !sku) {
      return res.status(400).json({
        error: "Name and SKU are required",
      });
    }

    const existingSku = await prisma.product.findFirst({
      where: {
        sku,
        organizationId: req.user.organizationId,
      },
    });

    if (existingSku) {
      return res
        .status(409)
        .json({ error: "SKU already exists for this organization" });
    }

    const product = await prisma.product.create({
      data: {
        name: name,
        sku: sku,
        quantityOnHand: Number(quantity),
        costPrice: cost_price ? Number(cost_price) : null,
        sellingPrice: selling_price ? Number(selling_price) : null,
        lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : null,
        organization: {
          connect: {
            id: req.user!.organizationId,
          },
        },
      },
    });

    return res
      .status(201)
      .json({ message: "Product created successfully!", product });
  } catch (error) {
    console.error("error creating product", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "product id is required" });
    }

    const {
      name,
      sku,
      description,
      quantity,
      cost_price,
      selling_price,
      lowStockThreshold,
    } = req.body;

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: id,
        organizationId: req.user.organizationId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (sku && sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findFirst({
        where: {
          sku,
          organizationId: req.user.organizationId,
          id: { not: id },
        },
      });

      if (skuExists) {
        return res.status(409).json({
          error: "SKU already exists for this organization",
        });
      }
    }
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (description !== undefined) updateData.description = description;
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (cost_price !== undefined)
      updateData.costPrice = cost_price ? Number(cost_price) : null;
    if (selling_price !== undefined)
      updateData.sellingPrice = selling_price ? Number(selling_price) : null;
    if (lowStockThreshold !== undefined)
      updateData.lowStockThreshold = lowStockThreshold
        ? Number(lowStockThreshold)
        : null;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("error creating product", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "product id is required" });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: id,
        organizationId: req.user.organizationId,
      },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("error deleting product", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
