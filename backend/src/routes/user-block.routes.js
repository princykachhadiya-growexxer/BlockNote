import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { listUserBlocks, toggleStar } from "../controllers/block.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", listUserBlocks);
router.patch("/:blockId/star", toggleStar);

export default router;
