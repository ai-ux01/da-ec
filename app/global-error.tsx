"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui" }}>
          <h1>Something went wrong</h1>
          <p>We’ve been notified. Please try again.</p>
          <button type="button" onClick={() => reset()} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
