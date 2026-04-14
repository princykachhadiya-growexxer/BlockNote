import express from "express";
import authRoutes from "./auth.routes.js";
import documentRoutes from "./document.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/documents", documentRoutes);

export default router;