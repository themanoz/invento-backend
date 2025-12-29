import express from "express";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/list", authMiddleware, listProducts);
router.post("/create", authMiddleware, createProduct);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
