import express from "express";
import path from "path";
import cors from "cors";
import { config } from "./lib/config.js";
import { catalogController } from "./modules/catalog/catalog.controller.js";
import { mountRoutes } from "./routes/index.js";

const app = express();

// Local uploads (when S3 credentials not set) — serve at /api/uploads/*
const uploadsDir = path.join(process.cwd(), "uploads");
app.use(`${config.apiPrefix}/uploads`, express.static(uploadsDir));

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "amrytum-backend" });
});

// Public catalog — register on app so GET /api/catalog never hits auth-protected routes
const catalogHandler = catalogController.getPublic.bind(catalogController);
app.get(`${config.apiPrefix}/catalog`, catalogHandler);
app.get(`${config.apiPrefix}/catalog/`, catalogHandler);

mountRoutes(app);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`AMRYTUM backend listening on port ${config.port} (${config.nodeEnv})`);
});
