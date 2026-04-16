import express from "express";
import authRoutes from "./auth.routes.js";
import blockRoutes from "./user-block.routes.js";
import documentRoutes from "./document.routes.js";
import shareRoutes from "./share.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/blocks", blockRoutes);
router.use("/documents", documentRoutes);
router.use("/share", shareRoutes);

export default router;
