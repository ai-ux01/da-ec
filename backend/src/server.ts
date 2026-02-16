import crypto from "crypto";
import express from "express";
import path from "path";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { config } from "./lib/config.js";
import { log } from "./lib/logger.js";
import { catalogController } from "./modules/catalog/catalog.controller.js";
import { paymentController } from "./modules/payment/payment.controller.js";
import { mountRoutes } from "./routes/index.js";

const app = express();

function requestId(): string {
  return crypto.randomBytes(8).toString("hex");
}
app.use((req: express.Request, _res, next) => {
  (req as express.Request & { requestId: string }).requestId = requestId();
  next();
});
app.use((req: express.Request, _res, next) => {
  const id = (req as express.Request & { requestId?: string }).requestId;
  log("info", `${req.method} ${req.path}`, { requestId: id });
  next();
});

// Local uploads (when S3 credentials not set) — serve at /api/uploads/*
const uploadsDir = path.join(process.cwd(), "uploads");
app.use(`${config.apiPrefix}/uploads`, express.static(uploadsDir));

const corsOptions: cors.CorsOptions = {
  origin: config.cors.allowedOrigin
    ? config.cors.allowedOrigin.split(",").map((o) => o.trim()).filter(Boolean)
    : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Razorpay-Signature"],
};
app.use(cors(corsOptions));

// Razorpay webhook: must receive raw body for signature verification (mount before express.json())
app.post(
  `${config.apiPrefix}/payment/webhook`,
  express.raw({ type: "application/json" }),
  (req: express.Request, _res, next) => {
    const raw = req.body as Buffer | undefined;
    (req as express.Request & { rawBody: string }).rawBody = Buffer.isBuffer(raw) ? raw.toString("utf8") : "";
    next();
  },
  (req, res) => paymentController.webhook(req, res)
);

app.use(express.json({ limit: "1mb" }));

// Rate limiting: auth and payment/order creation
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(`${config.apiPrefix}/auth/request-otp`, authRateLimiter);
app.use(`${config.apiPrefix}/auth/verify-otp`, authRateLimiter);
app.use(`${config.apiPrefix}/admin/auth/request-link`, authRateLimiter);
app.use(`${config.apiPrefix}/payment/create-order`, rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false }));
app.use(`${config.apiPrefix}/payment/create-order-cod`, rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false }));
app.use(`${config.apiPrefix}/payment/verify`, rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false }));
app.use(`${config.apiPrefix}/order/create`, rateLimit({ windowMs: 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "amrytum-backend" });
});

// Public catalog — register on app so GET /api/catalog never hits auth-protected routes
const catalogHandler = catalogController.getPublic.bind(catalogController);
app.get(`${config.apiPrefix}/catalog`, catalogHandler);
app.get(`${config.apiPrefix}/catalog/`, catalogHandler);

mountRoutes(app);

app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const id = (req as express.Request & { requestId?: string }).requestId;
  log("error", err.message, { requestId: id, stack: err.stack });
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  log("info", `AMRYTUM backend listening on port ${config.port}`, { nodeEnv: config.nodeEnv });
});
