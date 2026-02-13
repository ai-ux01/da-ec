import "dotenv/config";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}. Copy .env.example to .env and set the required variables.`);
  return v;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

const nodeEnv = optionalEnv("NODE_ENV", "development");
const isDev = nodeEnv === "development";

// In development, allow missing DATABASE_URL/JWT_SECRET so server can start (will fail on first DB/auth use)
const databaseUrl = process.env.DATABASE_URL ?? (isDev ? "postgresql://localhost:5432/amrytum?schema=public" : "");
const jwtSecret = process.env.JWT_SECRET ?? (isDev ? "dev-secret-min-32-chars-change-in-production" : "");

if (isDev && !process.env.DATABASE_URL) {
  console.warn("Warning: DATABASE_URL not set. Using default postgresql://localhost:5432/amrytum — create .env from .env.example to override.");
}
if (isDev && !process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET not set. Using a dev default — set JWT_SECRET in .env for production.");
}

export const config = {
  nodeEnv,
  port: parseInt(optionalEnv("PORT", "4000"), 10),
  apiPrefix: optionalEnv("API_PREFIX", "/api"),

  database: {
    url: databaseUrl || requireEnv("DATABASE_URL"),
  },

  jwt: {
    secret: jwtSecret || requireEnv("JWT_SECRET"),
    expiresIn: "7d",
  },

  magicLink: {
    baseUrl: optionalEnv("MAGIC_LINK_BASE_URL", "http://localhost:4000/api/admin/auth/verify"),
    tokenExpiryMinutes: 15,
  },

  otp: {
    expiryMinutes: 5,
    maxAttemptsPerPhone: 3,
    length: 6,
  },

  customerJwt: {
    // Long-lived so customer stays logged in (token in localStorage); override with CUSTOMER_JWT_EXPIRES_IN if needed
    expiresIn: optionalEnv("CUSTOMER_JWT_EXPIRES_IN", "3650d"),
  },

  s3: {
    endpoint: optionalEnv("S3_ENDPOINT", "http://localhost:9000"),
    region: optionalEnv("S3_REGION", "us-east-1"),
    bucket: optionalEnv("S3_BUCKET", "amrytum"),
    accessKey: optionalEnv("S3_ACCESS_KEY", ""),
    secretKey: optionalEnv("S3_SECRET_KEY", ""),
    useSSL: optionalEnv("S3_USE_SSL", "false") === "true",
  },
} as const;
