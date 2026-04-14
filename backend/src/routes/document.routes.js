import express from "express";
import * as controller from "../controllers/document.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", controller.getAllDocs);
router.post("/", controller.createDoc);
router.patch("/:id", controller.updateDoc);
router.delete("/:id", controller.deleteDoc);

export default router;