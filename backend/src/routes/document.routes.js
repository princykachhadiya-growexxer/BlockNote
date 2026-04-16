import express from "express";
import * as controller from "../controllers/document.controller.js";
import { manageShare } from "../controllers/share.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import blockRoutes from "./block.routes.js";

const router = express.Router({ mergeParams: true });

router.use(requireAuth);
router.use("/:docId/blocks", blockRoutes);

router.get("/", controller.getAllDocs);
router.get("/analytics", controller.getAnalytics);
router.patch("/:id/star", controller.toggleStar);
router.post("/:id/restore", controller.restoreDoc);
router.delete("/:id/permanent", controller.permanentlyDeleteDoc);
router.post("/:docId/share", manageShare);
router.get("/:id", controller.getDoc);
router.post("/", controller.createDoc);
router.patch("/:id", controller.updateDoc);
router.delete("/:id", controller.deleteDoc);

export default router;
