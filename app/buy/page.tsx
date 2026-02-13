"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { products, getProductById } from "@/lib/mockData";

export default function BuyPage() {
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [selectedSizeId, setSelectedSizeId] = useState(products[0].defaultSizeId);
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const { cart, addItem } = useCart();

  const product = getProductById(selectedProductId) ?? products[0];

  const handleProductSelect = (productId: string) => {
    const p = getProductById(productId);
    if (p) {
      setSelectedProductId(productId);
      setSelectedSizeId(p.defaultSizeId);
      setQuantity(1);
    }
  };

  const selectedSize = product.sizes.find((s) => s.id === selectedSizeId)!;
  const lineTotal = selectedSize.price * quantity;

  const addToCart = () => {
    addItem(
      {
        productId: product.id,
        productName: product.name,
        sizeId: selectedSize.id,
        label: selectedSize.label,
        price: selectedSize.price,
        inr: selectedSize.inr,
      },
      quantity
    );
    setShowCheckout(true);
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartTotalFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cartTotal);
  const isEmpty = cart.length === 0;

  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-16 sm:py-24">
        <SectionHeading
          title="Buy Now"
          subtitle="Glass jar. Lab-tested. No shortcuts."
        />

        <div className="mb-12 sm:mb-16">
          <p className="text-sm font-medium text-earth-600 mb-4">Select product</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {products.map((p) => (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => handleProductSelect(p.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                className={`text-left p-5 rounded-xl border transition-colors duration-200 ${
                  selectedProductId === p.id
                    ? "border-earth-600 bg-earth-200/10"
                    : "border-earth-200/60 bg-cream-50 hover:border-earth-400"
                }`}
              >
                <div className="aspect-square rounded-lg bg-earth-200/15 mb-3 flex items-center justify-center">
                  <span className="text-earth-300 text-xs">Image</span>
                </div>
                <h3 className="font-serif text-lg text-earth-600">{p.name}</h3>
                <p className="mt-1 text-sm text-earth-400 line-clamp-2">
                  {p.description}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
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
                    onClick={() => setSelectedSizeId(size.id)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      selectedSizeId === size.id
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
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-10 w-10 rounded-lg border border-earth-300 text-earth-600 hover:border-earth-500 hover:bg-cream-200/50 transition-colors flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="text-lg font-medium text-earth-600 w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
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
              onClick={addToCart}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Add to cart
            </Button>
          </motion.div>
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
              className="relative w-full max-w-md bg-cream-50 rounded-t-2xl sm:rounded-2xl shadow-xl border border-earth-200/40 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-xl text-earth-600">
                    Your cart
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    className="p-2 text-earth-400 hover:text-earth-600 transition-colors"
                    aria-label="Close"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                {isEmpty ? (
                  <p className="text-earth-400 text-sm">Cart is empty.</p>
                ) : (
                  <ul className="space-y-4 mb-6">
                    {cart.map((item, index) => (
                      <li
                        key={`${item.productId}-${item.sizeId}-${index}`}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-earth-600">
                          {item.productName} — {item.label} × {item.quantity}
                        </span>
                        <span className="text-earth-600 font-medium">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          }).format(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-earth-200/50 pt-4 flex justify-between items-center">
                  <span className="font-medium text-earth-600">Total</span>
                  <span className="font-serif text-xl text-earth-600">
                    {cartTotalFormatted}
                  </span>
                </div>
                <p className="mt-4 text-xs text-earth-300">
                  Checkout is not implemented. This is a UI-only flow.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full mt-4"
                  onClick={() => setShowCheckout(false)}
                >
                  Continue (placeholder)
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
