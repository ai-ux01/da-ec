import { config } from "./config.js";

type LogLevel = "info" | "warn" | "error";

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  if (config.isProd) {
    return JSON.stringify(payload);
  }
  const metaStr = meta && Object.keys(meta).length > 0 ? " " + JSON.stringify(meta) : "";
  return `[${payload.timestamp}] ${level.toUpperCase()} ${message}${metaStr}`;
}

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const out = formatMessage(level, message, meta);
  if (level === "error") {
    console.error(out);
  } else if (level === "warn") {
    console.warn(out);
  } else {
    console.log(out);
  }
}
