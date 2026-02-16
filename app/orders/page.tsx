"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { fetchMyOrders, type MyOrderApi } from "@/lib/api";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function MyOrdersPage() {
  const { token, isLoggedIn, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<MyOrderApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !process.env.NEXT_PUBLIC_API_URL) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchMyOrders(token)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load orders");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (authLoading || (isLoggedIn && loading)) {
    return (
      <div className="pt-16 sm:pt-20">
        <Section className="py-16 sm:py-24">
          <p className="text-earth-400">Loading…</p>
        </Section>
      </div>
    );
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <div className="pt-16 sm:pt-20">
        <Section className="py-16 sm:py-24">
          <p className="text-earth-400">Orders are available when the API is configured.</p>
          <Button href="/buy" variant="outline" size="md" className="mt-4">
            Continue shopping
          </Button>
        </Section>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="pt-16 sm:pt-20">
        <Section className="py-16 sm:py-24">
          <SectionHeading title="My orders" subtitle="Log in to see your orders." />
          <p className="text-earth-500 text-sm mb-4">Use the same phone number you used at checkout.</p>
          <Button href="/buy" variant="primary" size="md">
            Go to shop
          </Button>
        </Section>
      </div>
    );
  }

  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-16 sm:py-24">
        <SectionHeading
          title="My orders"
          subtitle="Your order history and status."
        />
        {error && (
          <p className="text-red-600 text-sm mb-4" role="alert">
            {error}
          </p>
        )}
        {orders.length === 0 && !error && (
          <div>
            <p className="text-earth-500">You haven’t placed any orders yet.</p>
            <Button href="/buy" variant="outline" size="md" className="mt-4">
              Shop now
            </Button>
          </div>
        )}
        {orders.length > 0 && (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="block rounded-xl border border-earth-200/60 bg-cream-50 p-4 sm:p-5 hover:border-earth-400 transition-colors focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm font-medium text-earth-600">
                      {order.orderId}
                    </span>
                    <span className="text-earth-400 text-sm">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span
                      className={`rounded px-2 py-0.5 ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    <span className="rounded bg-earth-200/40 px-2 py-0.5 text-earth-600">
                      {order.deliveryStatus}
                    </span>
                    <span className="text-earth-500">{order.jar.size}</span>
                  </div>
                  <p className="mt-2 text-sm text-earth-500 line-clamp-2">{order.address}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-8">
          <Button href="/buy" variant="outline" size="md">
            Back to shop
          </Button>
        </div>
      </Section>
    </div>
  );
}
