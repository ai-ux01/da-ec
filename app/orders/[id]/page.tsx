"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { token, isLoggedIn, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<MyOrderApi[]>([]);
  const [loading, setLoading] = useState(true);

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
      .catch(() => { if (!cancelled) setOrders([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  const order = id ? orders.find((o) => o.id === id) : null;

  useEffect(() => {
    if (loading || authLoading) return;
    if (!process.env.NEXT_PUBLIC_API_URL || !isLoggedIn) {
      router.replace("/orders");
    }
  }, [loading, authLoading, isLoggedIn, router]);

  if (authLoading || (isLoggedIn && loading)) {
    return (
      <div className="pt-16 sm:pt-20">
        <Section className="py-16 sm:py-24">
          <p className="text-earth-400">Loading…</p>
        </Section>
      </div>
    );
  }

  if (!process.env.NEXT_PUBLIC_API_URL || !isLoggedIn) {
    return null;
  }

  if (!order) {
    return (
      <div className="pt-16 sm:pt-20">
        <Section className="py-16 sm:py-24">
          <SectionHeading title="Order not found" subtitle="This order may not exist or you don’t have access to it." />
          <Button href="/orders" variant="outline" size="md">
            Back to my orders
          </Button>
        </Section>
      </div>
    );
  }

  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-16 sm:py-24">
        <nav className="mb-6 text-sm text-earth-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/orders" className="hover:text-earth-600">My orders</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-mono text-earth-600">{order.orderId}</li>
          </ol>
        </nav>
        <SectionHeading
          title={`Order ${order.orderId}`}
          subtitle={`Placed on ${formatDate(order.createdAt)}`}
        />
        <div className="rounded-xl border border-earth-200/60 bg-cream-50 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-earth-200/40">
            <h3 className="text-sm font-medium text-earth-500 mb-2">Status</h3>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  order.paymentStatus === "PAID"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                Payment: {order.paymentStatus}
              </span>
              <span className="rounded bg-earth-200/40 px-2 py-1 text-xs font-medium text-earth-600">
                Delivery: {order.deliveryStatus}
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-6 border-b border-earth-200/40">
            <h3 className="text-sm font-medium text-earth-500 mb-2">Items</h3>
            <ul className="space-y-2">
              <li className="flex justify-between text-sm text-earth-600">
                <span>1 × {order.jar.size}</span>
                <span>A2 Desi Cow Ghee</span>
              </li>
            </ul>
          </div>
          <div className="p-4 sm:p-6">
            <h3 className="text-sm font-medium text-earth-500 mb-2">Shipping address</h3>
            <p className="text-sm text-earth-600 whitespace-pre-line">{order.address}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/orders" variant="outline" size="md">
            Back to my orders
          </Button>
          <Button href="/buy" variant="secondary" size="md">
            Continue shopping
          </Button>
        </div>
      </Section>
    </div>
  );
}
