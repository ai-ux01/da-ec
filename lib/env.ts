/**
 * Environment validation. Use in app entry (layout or root) and in API client.
 * In production, NEXT_PUBLIC_API_URL must be set and must not be localhost.
 */

const isProd = process.env.NODE_ENV === "production";

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (isProd && !url) {
    throw new Error("NEXT_PUBLIC_API_URL is required in production. Set it in your deployment environment.");
  }
  if (isProd && (url.includes("localhost") || url.startsWith("http://127.0.0.1"))) {
    throw new Error("NEXT_PUBLIC_API_URL must not point to localhost in production.");
  }
  return url;
}

function getRazorpayKeyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
}

/** Validated API base URL. Throws in production if missing or localhost. */
export function getPublicApiUrl(): string {
  return getApiUrl();
}

/** Whether payment (Razorpay) is configured. */
export function isRazorpayConfigured(): boolean {
  return !!getRazorpayKeyId();
}

/** Razorpay key ID for checkout (public key only). */
export function getRazorpayKey(): string {
  return getRazorpayKeyId();
}
