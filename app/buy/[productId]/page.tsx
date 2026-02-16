"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { CheckoutPanel } from "@/components/CheckoutPanel";
import { fetchCatalog, fetchStockAvailability, type ProductApi, type StockAvailabilityApi } from "@/lib/api";
import { products as mockProducts } from "@/lib/mockData";

function sizeIdToJarSizeKey(sizeId: string): keyof StockAvailabilityApi | null {
  const lower = sizeId.toLowerCase();
  if (lower.includes("250")) return "SIZE_250ML";
  if (lower.includes("500")) return "SIZE_500ML";
  if (lower.includes("1l") || lower.includes("1 l")) return "SIZE_1L";
  return null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.productId as string;
  const [products, setProducts] = useState<ProductApi[]>(mockProducts);
  const [loading, setLoading] = useState(!!process.env.NEXT_PUBLIC_API_URL);
  const [availability, setAvailability] = useState<StockAvailabilityApi | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setLoading(false);
      setSelectedSizeId(mockProducts[0]?.defaultSizeId ?? "");
      return;
    }
    let cancelled = false;
    fetchCatalog()
      .then((data) => {
        if (!cancelled && data.products?.length) {
          setProducts(data.products);
          const p = data.products.find((x) => x.id === productId);
          if (p) setSelectedSizeId(p.defaultSizeId);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) return;
    let cancelled = false;
    fetchStockAvailability()
      .then((data) => { if (!cancelled) setAvailability(data); })
      .catch(() => { if (!cancelled) setAvailability(null); });
    return () => { cancelled = true; };
  }, []);

  const product = products.find((p) => p.id === productId);
  const size = product?.sizes?.find((s) => s.id === selectedSizeId) ?? product?.sizes?.[0];
  const sizeKey = size ? sizeIdToJarSizeKey(size.id) : null;
  const available = sizeKey && availability ? availability[sizeKey] ?? 0 : null;
  const outOfStock = available === 0;
  const atLimit = available != null && quantity >= available;
  const lineTotal = size ? size.price * quantity : 0;
  const addDisabled = !size || outOfStock || (available != null && quantity > available);

  const addToCart = () => {
    if (!product || !size) return;
    addItem(
      {
        productId: product.id,
        productName: product.name,
        sizeId: size.id,
        label: size.label,
        price: size.price,
        inr: size.inr,
      },
      quantity
    );
    setShowCheckout(true);
  };

  if (loading && !product) {
    return (
      <div className="pt-16 sm:pt-20">
        <Section className="py-16 sm:py-24">
          <p className="text-earth-400">Loading…</p>
        </Section>
      </div>
    );
  }

  useEffect(() => {
    if (product?.sizes?.length) {
      setSelectedSizeId((prev) => {
        const valid = product.sizes!.some((s) => s.id === prev);
        return valid ? prev : (product.defaultSizeId ?? product.sizes![0].id);
      });
    }
  }, [product?.id]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} — AMRYTUM`;
    }
    return () => {
      document.title = "AMRYTUM — A2 Desi Cow Ghee";
    };
  }, [product?.name]);

  if (!product) {
    return (
      <div className="pt-16 sm:pt-20">
        <Section className="py-16 sm:py-24">
          <p className="text-earth-500 mb-4">Product not found.</p>
          <Button href="/buy" variant="outline" size="md">
            View all products
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
            <li><Link href="/" className="hover:text-earth-600">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/buy" className="hover:text-earth-600">Buy</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-earth-600">{product.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="aspect-square max-w-md rounded-xl overflow-hidden bg-gradient-to-br from-earth-200/30 to-earth-300/20 border border-earth-200/40 flex items-center justify-center">
            <span className="font-serif text-earth-400/80 text-lg tracking-widest">AMRYTUM</span>
          </div>

          <div className="space-y-6">
            <h1 className="font-serif text-display-md text-earth-600">{product.name}</h1>
            <p className="text-earth-400 leading-relaxed">{product.description}</p>

            <div>
              <p className="text-sm font-medium text-earth-600 mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSizeId(s.id)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-50 ${
                      selectedSizeId === s.id
                        ? "border-earth-600 bg-earth-600 text-cream-50"
                        : "border-earth-300 text-earth-600 hover:border-earth-500 bg-cream-50"
                    }`}
                  >
                    {s.label} — {s.inr}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-earth-600 mb-2">
                Quantity
                {available != null && (
                  <span className="ml-1.5 text-earth-400 font-normal">({available} available)</span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-lg border border-earth-300 text-earth-600 hover:border-earth-500 disabled:opacity-50 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-earth-400"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="text-lg font-medium text-earth-600 w-8 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => (available != null ? Math.min(available, q + 1) : q + 1))}
                  disabled={atLimit}
                  className="h-10 w-10 rounded-lg border border-earth-300 text-earth-600 hover:border-earth-500 disabled:opacity-50 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-earth-400"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-earth-200/50">
              <p className="text-earth-400 text-sm">Total</p>
              <p className="font-serif text-2xl text-earth-600 mt-1">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(lineTotal)}
              </p>
            </div>

            <Button
              onClick={addToCart}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              disabled={addDisabled}
            >
              {outOfStock ? "Out of stock" : "Add to cart"}
            </Button>

            <p className="text-sm text-earth-400">
              <Link href="/buy" className="underline underline-offset-2 hover:text-earth-600">
                View all products
              </Link>
            </p>
          </div>
        </div>
      </Section>

      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5"
            onClick={() => setShowCheckout(false)}
          >
            <div className="absolute inset-0 bg-earth-600/20 backdrop-blur-sm" aria-hidden />
            <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-cream-50 rounded-t-2xl sm:rounded-2xl shadow-xl border border-earth-200/40 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-earth-200/40 shrink-0">
              <h2 className="font-serif text-xl text-earth-600">Checkout</h2>
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                className="p-2 text-earth-400 hover:text-earth-600"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0">
              <CheckoutPanel
                onClose={() => setShowCheckout(false)}
                onDone={() => setShowCheckout(false)}
              />
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
