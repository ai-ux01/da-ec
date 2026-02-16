"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { CheckoutPanel } from "@/components/CheckoutPanel";
import { fetchCatalog, fetchStockAvailability, type ProductApi, type StockAvailabilityApi } from "@/lib/api";
import { products as mockProducts } from "@/lib/mockData";

function getProductById(products: ProductApi[], id: string): ProductApi | undefined {
  return products.find((p) => p.id === id);
}

/** Map catalog size id (e.g. 250ml, 1L) to backend JarSize key for availability. */
function sizeIdToJarSizeKey(sizeId: string): keyof StockAvailabilityApi {
  const lower = sizeId.toLowerCase();
  if (lower.includes("250")) return "SIZE_250ML";
  if (lower.includes("500")) return "SIZE_500ML";
  if (lower.includes("1l") || lower.includes("1 l")) return "SIZE_1L";
  return "SIZE_500ML";
}

type ProductOption = { sizeId: string; quantity: number };

function defaultOptions(products: ProductApi[]): Record<string, ProductOption> {
  const out: Record<string, ProductOption> = {};
  for (const p of products) {
    out[p.id] = { sizeId: p.defaultSizeId, quantity: 1 };
  }
  return out;
}

export default function BuyPage() {
  const [products, setProducts] = useState<ProductApi[]>(mockProducts);
  const [catalogLoading, setCatalogLoading] = useState(!!process.env.NEXT_PUBLIC_API_URL);
  const [selectedProductId, setSelectedProductId] = useState(mockProducts[0].id);
  const [productOptions, setProductOptions] = useState<Record<string, ProductOption>>(() =>
    defaultOptions(mockProducts)
  );
  const [showCheckout, setShowCheckout] = useState(false);
  const [availability, setAvailability] = useState<StockAvailabilityApi | null>(null);
  const { cart, addItem } = useCart();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) return;
    let cancelled = false;
    fetchStockAvailability()
      .then((data) => {
        if (!cancelled) setAvailability(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Clamp quantities when availability loads or changes
  useEffect(() => {
    if (!availability) return;
    setProductOptions((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const [productId, opt] of Object.entries(next)) {
        const available = availability[sizeIdToJarSizeKey(opt.sizeId)] ?? 0;
        if (opt.quantity > available) {
          next[productId] = { ...opt, quantity: Math.max(1, available) };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [availability]);

  const getAvailableForSize = (sizeId: string): number | null => {
    if (!availability) return null;
    return availability[sizeIdToJarSizeKey(sizeId)] ?? 0;
  };

  const setOption = (productId: string, update: Partial<ProductOption>) => {
    setProductOptions((prev) => {
      const next = { ...(prev[productId] ?? { sizeId: "", quantity: 1 }), ...update };
      const sizeId = next.sizeId || prev[productId]?.sizeId;
      const available = sizeId != null ? getAvailableForSize(sizeId) : null;
      if (available != null && next.quantity > available) {
        next.quantity = Math.max(1, available);
      }
      return { ...prev, [productId]: next };
    });
  };

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setCatalogLoading(false);
      return;
    }
    let cancelled = false;
    fetchCatalog()
      .then((data) => {
        if (!cancelled && data.products?.length) {
          setProducts(data.products);
          setProductOptions(defaultOptions(data.products));
          setSelectedProductId((prev) => {
            const exists = data.products.some((p) => p.id === prev);
            return exists ? prev : data.products[0].id;
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const product = getProductById(products, selectedProductId) ?? products[0];
  const selectedOpt = productOptions[product.id] ?? { sizeId: product.defaultSizeId, quantity: 1 };
  const selectedSize = product?.sizes?.find((s) => s.id === selectedOpt.sizeId) ?? product?.sizes?.[0];
  const lineTotal = selectedSize ? selectedSize.price * selectedOpt.quantity : 0;

  const handleProductSelect = (productId: string) => {
    if (getProductById(products, productId)) setSelectedProductId(productId);
  };

  const addToCartForProduct = (p: ProductApi, opt: ProductOption) => {
    const size = p.sizes.find((s) => s.id === opt.sizeId);
    if (!size) return;
    addItem(
      {
        productId: p.id,
        productName: p.name,
        sizeId: size.id,
        label: size.label,
        price: size.price,
        inr: size.inr,
      },
      opt.quantity
    );
  };

  const addToCartFromDetail = () => {
    if (!product || !selectedSize) return;
    addToCartForProduct(product, selectedOpt);
    setShowCheckout(true);
  };

  if (catalogLoading && products.length === 0) {
    return (
      <div className="pt-16 sm:pt-20">
        <Section className="py-16 sm:py-24">
          <p className="text-earth-400">Loading products…</p>
        </Section>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-16 sm:pt-20">
        <Section className="py-16 sm:py-24">
          <p className="text-earth-400">No products available.</p>
        </Section>
      </div>
    );
  }

  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-16 sm:py-24">
        <SectionHeading
          title="Buy Now"
          subtitle="Glass jar. Lab-tested. No shortcuts."
        />

        <div className="mb-12 sm:mb-16">
          <p className="text-sm font-medium text-earth-600 mb-4">Products</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => {
              const opt = productOptions[p.id] ?? { sizeId: p.defaultSizeId, quantity: 1 };
              const size = p.sizes.find((s) => s.id === opt.sizeId) ?? p.sizes[0];
              const available = size ? getAvailableForSize(size.id) : null;
              const atLimit = available != null && opt.quantity >= available;
              const outOfStock = available === 0;
              const addDisabled = !size || outOfStock || (available != null && opt.quantity > available);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: reduceMotion ? 0 : i * 0.05,
                  }}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
                    selectedProductId === p.id
                      ? "border-earth-600 bg-earth-200/10"
                      : "border-earth-200/60 bg-cream-50 hover:border-earth-400"
                  }`}
                >
                  <Link
                    href={`/buy/${p.id}`}
                    className="block w-full text-left p-5 pb-2 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-inset rounded-xl"
                  >
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-earth-200/30 to-earth-300/20 mb-3 flex items-center justify-center border border-earth-200/40">
                      <span className="font-serif text-earth-400/80 text-sm tracking-widest">AMRYTUM</span>
                    </div>
                    <h3 className="font-serif text-lg text-earth-600">{p.name}</h3>
                    <p className="mt-1 text-sm text-earth-400 line-clamp-2">
                      {p.description}
                    </p>
                  </Link>
                  <div className="px-5 pb-5 space-y-4" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <p className="text-xs font-medium text-earth-500 mb-2">Size</p>
                      <div className="flex flex-wrap gap-2">
                        {p.sizes.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setOption(p.id, { sizeId: s.id })}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              opt.sizeId === s.id
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
                      <p className="text-xs font-medium text-earth-500 mb-2">
                        Quantity
                        {available != null && (
                          <span className="ml-1.5 text-earth-400 font-normal">
                            ({available} available)
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOption(p.id, { quantity: Math.max(1, opt.quantity - 1) })}
                          disabled={opt.quantity <= 1}
                          className="h-8 w-8 rounded-lg border border-earth-300 text-earth-600 hover:border-earth-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium text-earth-600 w-6 text-center">
                          {opt.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setOption(p.id, { quantity: opt.quantity + 1 })}
                          disabled={atLimit}
                          className="h-8 w-8 rounded-lg border border-earth-300 text-earth-600 hover:border-earth-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        addToCartForProduct(p, opt);
                      }}
                      disabled={addDisabled}
                    >
                      {outOfStock ? "Out of stock" : "Add to cart"}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="aspect-square max-w-md bg-earth-200/15 rounded-2xl flex items-center justify-center"
          >
            <span className="text-earth-300 text-sm">Product image</span>
          </motion.div>

          <motion.div
            key={`detail-${product.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-serif text-display-lg text-earth-600">
                {product.name}
              </h2>
              <p className="mt-2 text-earth-400">{product.description}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-earth-600 mb-3">Size</p>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setOption(product.id, { sizeId: size.id })}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      selectedOpt.sizeId === size.id
                        ? "border-earth-600 bg-earth-600 text-cream-50"
                        : "border-earth-300 text-earth-600 hover:border-earth-500 bg-cream-50"
                    }`}
                  >
                    {size.label} — {size.inr}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-earth-600 mb-3">
                Quantity
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setOption(product.id, { quantity: Math.max(1, selectedOpt.quantity - 1) })}
                  className="h-10 w-10 rounded-lg border border-earth-300 text-earth-600 hover:border-earth-500 hover:bg-cream-200/50 transition-colors flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="text-lg font-medium text-earth-600 w-8 text-center">
                  {selectedOpt.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setOption(product.id, { quantity: selectedOpt.quantity + 1 })}
                  className="h-10 w-10 rounded-lg border border-earth-300 text-earth-600 hover:border-earth-500 hover:bg-cream-200/50 transition-colors flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-earth-200/50">
              <p className="text-earth-400 text-sm">Total</p>
              <p className="font-serif text-2xl text-earth-600 mt-1">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(lineTotal)}
              </p>
            </div>

            <Button
              onClick={addToCartFromDetail}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Add to cart
            </Button>
          </motion.div>
        </div> */}
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
            <div
              className="absolute inset-0 bg-earth-600/20 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-cream-50 rounded-t-2xl sm:rounded-2xl shadow-xl border border-earth-200/40 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-earth-200/40 shrink-0">
                <h3 className="font-serif text-xl text-earth-600">Checkout</h3>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="p-2 text-earth-400 hover:text-earth-600 transition-colors"
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
