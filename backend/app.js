import express from "express";
import cookieParser from "cookie-parser";
import { Prisma } from "@prisma/client";
import routes from "./src/routes/index.js";
import { ApiError } from "./src/utils/ApiError.js";
import { HTTP } from "./src/utils/httpStatus.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    const statusCode = Number.isInteger(err.statusCode)
      ? err.statusCode
      : HTTP.INTERNAL_SERVER_ERROR;
    return res.status(statusCode).json({ message: err.message, errors: err.errors });
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      message: "Database request failed",
      code: err.code,
      meta: err.meta,
    });
  }

  if (
    err instanceof Prisma.PrismaClientUnknownRequestError ||
    err instanceof Prisma.PrismaClientInitializationError
  ) {
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      message: "Database is unavailable or schema is out of date",
    });
  }

  return res
    .status(HTTP.INTERNAL_SERVER_ERROR)
    .json({ message: "Internal server error" });
});

export default app;
