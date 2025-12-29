import express from "express";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
  .get(authMiddleware, listProducts)
  .post(authMiddleware, createProduct);

router.route("/:id")
  .put(authMiddleware, updateProduct)
  .delete(authMiddleware, deleteProduct);

export default router;
