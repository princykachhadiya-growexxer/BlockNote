import express from "express";
import * as controller from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);

export default router;