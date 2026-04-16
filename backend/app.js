import express from "express";
import cookieParser from "cookie-parser";
import routes from "./src/routes/index.js";
import { ApiError } from "./src/utils/ApiError.js";
import { HTTP } from "./src/utils/httpStatus.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, errors: err.errors });
  }

  console.error(err);
  return res
    .status(HTTP.INTERNAL_SERVER_ERROR)
    .json({ message: "Internal server error" });
});

export default app;
