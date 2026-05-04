import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(helmet());
app.use(
	cors({
		origin: FRONTEND_ORIGIN,
		credentials: true,
	}),
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", apiRoutes);
app.use(errorHandler);

export default app;
