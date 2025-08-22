import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import "express-async-errors";

import { rateLimiter, notFoundHandler, errorHandler } from "./middleware.js";
import personsRouter from "./routes/person.routes.js";
import { shutdownPool } from "./db.js";

dotenv.config();

const app = express();

// Core middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(morgan(process.env.LOG_LEVEL || "dev"));
app.use(rateLimiter(
  parseInt(process.env.RATE_WINDOW_MINUTES || "1"),
  parseInt(process.env.RATE_MAX_REQUESTS || "120")
));

// Routes
app.use("/api/persons", personsRouter);

// Health
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// 404 + Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`
Received ${signal}. Shutting down...`);
  server.close(async () => {
    await shutdownPool();
    console.log("Closed HTTP server & DB pool. Bye!");
    process.exit(0);
  });
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
