import express from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
    .get(authMiddleware, getSettings)
    .put(authMiddleware, updateSettings);

export default router;
