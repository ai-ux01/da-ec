"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function BuyError({
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
    <div className="pt-16 sm:pt-20">
      <div className="max-w-md mx-auto px-5 py-16 text-center">
        <h2 className="font-serif text-xl text-earth-600">Couldn’t load the shop</h2>
        <p className="mt-2 text-earth-500 text-sm">Please try again or come back later.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
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
