import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Strict CORS: only allow explicit origins when CORS_ORIGIN is set.
// When the frontend is served from this same server (single-domain deploy),
// same-origin requests don't need CORS headers, so no middleware is applied.
const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length > 0) {
  app.use(cors({ origin: allowedOrigins }));
}

app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const staticDir = process.env.STATIC_DIR
  ? path.resolve(process.env.STATIC_DIR)
  : path.resolve(import.meta.dirname, "../../fitsync/dist/public");

const hasFrontend = fs.existsSync(path.join(staticDir, "index.html"));

if (hasFrontend) {
  app.use(express.static(staticDir));

  // SPA fallback: serve index.html for any non-API route so client-side
  // routes keep working on a page refresh.
  app.get("/{*splat}", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(staticDir, "index.html"));
  });

  logger.info({ staticDir }, "Serving static frontend");
} else {
  logger.warn({ staticDir }, "Frontend build not found; API-only mode");
}

export default app;
