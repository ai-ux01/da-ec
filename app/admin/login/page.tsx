"use client";

import { useState } from "react";
import Link from "next/link";
import { requestAdminMagicLink } from "@/lib/api";

/** In dev, backend may return a link to the API; convert to frontend verify URL. */
function toFrontendVerifyUrl(devLink: string): string {
  try {
    const u = new URL(devLink);
    const token = u.searchParams.get("token");
    if (token && typeof window !== "undefined") {
      const origin = window.location.origin;
      return `${origin}/admin/verify?token=${encodeURIComponent(token)}`;
    }
  } catch {
    // ignore
  }
  return devLink;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDevLink(null);
    if (!email.trim()) {
      setError("Enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await requestAdminMagicLink(email.trim());
      setSent(true);
      if (res.dev_link) setDevLink(toFrontendVerifyUrl(res.dev_link));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-semibold text-cream-50">Admin</h1>
          <p className="mt-1 text-sm text-cream-200">AMRYTUM</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cream-200 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-earth-500/50 border border-earth-400 text-cream-50 placeholder-cream-300 focus:ring-2 focus:ring-gold-300/50 focus:border-earth-400"
                autoComplete="email"
              />
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gold-300/20 text-cream-50 border border-gold-300/50 hover:bg-gold-300/30 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 rounded-lg bg-earth-500/30 border border-earth-400 p-4">
            <p className="text-sm text-cream-100">
              Check your email for the magic link. In development, the link is below:
            </p>
            {devLink ? (
              <a
                href={devLink}
                className="block py-2 px-3 rounded bg-earth-600 text-cream-50 text-sm break-all hover:underline"
              >
                {devLink}
              </a>
            ) : (
              <p className="text-sm text-cream-200">Open the link from your email to sign in.</p>
            )}
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setDevLink(null);
              }}
              className="text-sm text-cream-300 hover:text-cream-50"
            >
              Use a different email
            </button>
          </div>
        )}

        <p className="text-center">
          <Link href="/" className="text-sm text-cream-300 hover:text-cream-50">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
