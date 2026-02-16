"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-900 px-5">
      <div className="max-w-md w-full text-center">
        <h1 className="font-serif text-xl text-cream-100">Something went wrong</h1>
        <p className="mt-2 text-cream-200/80 text-sm">You can try again or go back to login.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-cream-200/40 bg-cream-50 px-6 py-3 text-sm font-medium text-earth-700 hover:bg-cream-100 transition-colors"
          >
            Try again
          </button>
          <a
            href="/admin/login"
            className="rounded-lg border border-earth-600 bg-earth-600 px-6 py-3 text-sm font-medium text-cream-50 hover:bg-earth-500 transition-colors inline-block"
          >
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
}
