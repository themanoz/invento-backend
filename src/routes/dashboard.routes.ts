import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.route("/").get(authMiddleware, getDashboardStats);

export default router;
