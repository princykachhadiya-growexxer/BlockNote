import express from "express";
import cookieParser from "cookie-parser";
import routes from "./src/routes/index.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

export default app;