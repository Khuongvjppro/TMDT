import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();
const FRONTEND_ORIGINS = (
	process.env.FRONTEND_ORIGIN || "http://localhost:3000"
)
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

function isAllowedOrigin(origin: string) {
	if (FRONTEND_ORIGINS.includes(origin)) {
		return true;
	}

	// Next.js uses the next available port when 3000 is already occupied.
	return (
		process.env.NODE_ENV !== "production" &&
		/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
	);
}

app.use(helmet());
app.use(
	cors({
		origin(origin, callback) {
			if (!origin || isAllowedOrigin(origin)) {
				callback(null, true);
				return;
			}

			callback(new Error(`Origin ${origin} is not allowed by CORS`));
		},
		credentials: true,
	}),
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", apiRoutes);
app.use(errorHandler);

export default app;
