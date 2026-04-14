// import express from "express";
// import cookieParser from "cookie-parser";
// import { z } from "zod";
// import { prisma } from "./src/lib/prisma.js";
// import { verifyPassword, hashPassword, validatePasswordRules } from "./src/lib/password.js";
// import { signAccess, signRefresh, verifyRefresh } from "./src/lib/auth-tokens.js";
// import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } from "./src/lib/refresh-cookie.js";
// import { getUserIdFromRequest } from "./src/lib/api-auth.js";
// import { sendAuthRouteError } from "./src/lib/auth-route-errors.js";

// const app = express();
// app.use(express.json());
// app.use(cookieParser());

// const loginBody = z.object({
//   email: z.string().email(),
//   password: z.string(),
// });

// const registerBody = z.object({
//   email: z.string().email(),
//   password: z.string(),
// });

// const patchDocBody = z.object({
//   title: z.string().min(1).max(500),
// });

// app.post("/api/auth/login", async (req, res) => {
//   let json = req.body;
//   if (json == null || typeof json !== "object") {
//     return res.status(422).json({ message: "Invalid JSON body." });
//   }

//   const parsed = loginBody.safeParse(json);
//   if (!parsed.success) {
//     return res.status(422).json({ message: "Invalid email or password payload." });
//   }

//   const { email, password } = parsed.data;

//   try {
//     const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
//     if (!user || !(await verifyPassword(password, user.password_hash))) {
//       return res.status(401).json({ message: "Invalid email or password." });
//     }

//     const accessToken = signAccess(user.id);
//     const refreshToken = signRefresh(user.id);
//     setRefreshCookie(res, refreshToken);
//     return res.json({ accessToken, user: { id: user.id, email: user.email } });
//   } catch (e) {
//     return sendAuthRouteError(res, e, "POST /api/auth/login");
//   }
// });

// app.post("/api/auth/register", async (req, res) => {
//   let json = req.body;
//   if (json == null || typeof json !== "object") {
//     return res.status(422).json({ message: "Invalid JSON body." });
//   }

//   const parsed = registerBody.safeParse(json);
//   if (!parsed.success) {
//     return res.status(422).json({ message: "Invalid email or password payload." });
//   }

//   const { email, password } = parsed.data;
//   const pwdErr = validatePasswordRules(password);
//   if (pwdErr) {
//     return res.status(422).json({ message: pwdErr });
//   }

//   try {
//     const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
//     if (existing) {
//       return res.status(409).json({ message: "An account with this email already exists." });
//     }

//     const password_hash = await hashPassword(password);
//     const user = await prisma.user.create({
//       data: { email: email.toLowerCase(), password_hash },
//     });

//     const accessToken = signAccess(user.id);
//     const refreshToken = signRefresh(user.id);
//     setRefreshCookie(res, refreshToken);
//     return res.json({ accessToken, user: { id: user.id, email: user.email } });
//   } catch (e) {
//     return sendAuthRouteError(res, e, "POST /api/auth/register");
//   }
// });

// app.post("/api/auth/refresh", async (req, res) => {
//   const raw = req.cookies[REFRESH_COOKIE_NAME];
//   if (!raw) {
//     return res.status(401).json({ message: "Missing refresh token." });
//   }

//   const userId = verifyRefresh(raw);
//   if (!userId) {
//     clearRefreshCookie(res);
//     return res.status(401).json({ message: "Invalid or expired refresh token." });
//   }

//   const user = await prisma.user.findUnique({ where: { id: userId } });
//   if (!user) {
//     clearRefreshCookie(res);
//     return res.status(401).json({ message: "User no longer exists." });
//   }

//   const accessToken = signAccess(user.id);
//   const newRefresh = signRefresh(user.id);
//   setRefreshCookie(res, newRefresh);
//   return res.json({ accessToken, user: { id: user.id, email: user.email } });
// });

// app.post("/api/auth/logout", (_req, res) => {
//   clearRefreshCookie(res);
//   return res.json({ ok: true });
// });

// app.get("/api/documents", async (req, res) => {
//   const userId = getUserIdFromRequest(req);
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized." });
//   }

//   const documents = await prisma.document.findMany({
//     where: { user_id: userId },
//     orderBy: { updated_at: "desc" },
//     select: {
//       id: true,
//       title: true,
//       updated_at: true,
//     },
//   });

//   return res.json({ documents });
// });

// app.post("/api/documents", async (req, res) => {
//   const userId = getUserIdFromRequest(req);
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized." });
//   }

//   const doc = await prisma.document.create({
//     data: { user_id: userId, title: "Untitled" },
//     select: { id: true, title: true, updated_at: true },
//   });

//   return res.status(201).json({ document: doc });
// });

// app.patch("/api/documents/:id", async (req, res) => {
//   const userId = getUserIdFromRequest(req);
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized." });
//   }

//   const { id } = req.params;
//   let json = req.body;
//   if (json == null || typeof json !== "object") {
//     return res.status(422).json({ message: "Invalid JSON body." });
//   }

//   const parsed = patchDocBody.safeParse(json);
//   if (!parsed.success) {
//     return res.status(422).json({ message: "Title must be a non-empty string (max 500 chars)." });
//   }

//   const existing = await prisma.document.findFirst({
//     where: { id, user_id: userId },
//   });
//   if (!existing) {
//     return res.status(403).json({ message: "Document not found." });
//   }

//   const updated = await prisma.document.update({
//     where: { id },
//     data: { title: parsed.data.title },
//     select: { id: true, title: true, updated_at: true },
//   });

//   return res.json({ document: updated });
// });

// app.delete("/api/documents/:id", async (req, res) => {
//   const userId = getUserIdFromRequest(req);
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized." });
//   }

//   const { id } = req.params;

//   const existing = await prisma.document.findFirst({
//     where: { id, user_id: userId },
//   });
//   if (!existing) {
//     return res.status(403).json({ message: "Document not found." });
//   }

//   await prisma.document.delete({ where: { id } });
//   return res.status(204).send();
// });

// const port = Number(process.env.PORT) || 4000;
// app.listen(port, () => {
//   console.log(`API listening on http://127.0.0.1:${port}`);
// });
import app from "./app.js";

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});