import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { rejectShareWrites } from "../middleware/share.middleware.js";
import {
  listBlocks,
  addBlock,
  modifyBlock,
  removeBlock,
  reorder,
  split,
} from "../controllers/block.controller.js";

const router = express.Router({ mergeParams: true });

router.use(rejectShareWrites);
router.use(requireAuth);

router.get("/", listBlocks);
router.post("/", addBlock);
router.post("/reorder", reorder);
router.patch("/:blockId", modifyBlock);
router.delete("/:blockId", removeBlock);
router.post("/:blockId/split", split);

export default router;
