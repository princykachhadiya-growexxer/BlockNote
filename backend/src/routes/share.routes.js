import express from "express";
import { viewSharedDocument } from "../controllers/share.controller.js";

const router = express.Router();

router.get("/:token", viewSharedDocument);

export default router;
