"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
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
    <div className="min-h-screen flex flex-col items-center justify-center px-5 pt-16">
      <div className="max-w-md w-full text-center">
        <h1 className="font-serif text-display-md text-earth-600">Something went wrong</h1>
        <p className="mt-3 text-earth-500 text-sm">
          We’re sorry. You can try again or return to the home page.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" size="md" onClick={reset}>
            Try again
          </Button>
          <Button href="/" variant="outline" size="md">
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
