"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderIdsRaw = searchParams.get("orderIds");
  const orderIds = orderIdsRaw
    ? orderIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-16 sm:py-24">
        <SectionHeading
          title="Thank you for your order"
          subtitle="We’ve received your order and will process it shortly."
        />
        {orderIds.length > 0 && (
          <div className="rounded-xl border border-earth-200/60 bg-cream-50 p-4 sm:p-6 mb-8">
            <p className="text-sm font-medium text-earth-500 mb-2">Order {orderIds.length === 1 ? "ID" : "IDs"}</p>
            <p className="font-mono text-earth-600 text-sm break-all">
              {orderIds.join(", ")}
            </p>
            <p className="mt-3 text-sm text-earth-400">
              You can track and view details from My orders.
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <Button href="/orders" variant="primary" size="md">
            View my orders
          </Button>
          <Button href="/buy" variant="outline" size="md">
            Continue shopping
          </Button>
        </div>
      </Section>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-16 sm:pt-20">
          <Section className="py-16 sm:py-24">
            <p className="text-earth-400">Loading…</p>
          </Section>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
