import { Prisma } from "@prisma/client";

export function sendAuthRouteError(res, e, context) {
  console.error(`[${context}]`, e);

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    if (e.code === "P2021") {
      return res.status(503).json({
        message:
          "Database tables are missing. In the `backend` folder run `npm run db:push` (with Postgres running).",
      });
    }
  }

  if (e instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      message:
        "Cannot connect to the database. Start Postgres (from the project root: `docker compose up -d`), then check `DATABASE_URL` in `backend/.env`.",
    });
  }

  if (e instanceof Error && /JWT_(ACCESS|REFRESH)_SECRET/.test(e.message)) {
    return res.status(500).json({
      message:
        "Server configuration: set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in `backend/.env` (see `.env.example`).",
    });
  }

  return res.status(500).json({ message: "Something went wrong. Please try again." });
}
