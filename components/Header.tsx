"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/process", label: "Our Process" },
  { href: "/lab-reports", label: "Lab Reports" },
  { href: "/about", label: "About Founder" },
  { href: "/buy", label: "Buy Now" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-cream-50/95 backdrop-blur-sm border-b border-earth-200/30"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16 sm:h-20">
        <Link
          href="/"
          className="font-serif text-xl sm:text-2xl font-semibold text-earth-600 tracking-tight hover:text-earth-500 transition-colors duration-300"
        >
          AMRYTUM
        </Link>

        <div className="hidden md:flex items-center gap-8">
        <Link
          href="/buy"
          className="relative p-2 text-earth-400 hover:text-earth-600 transition-colors"
          aria-label="Cart"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-earth-600 text-cream-50 text-[10px] font-medium flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        <nav className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wide transition-colors duration-300 ${
                pathname === link.href
                  ? "text-earth-600 font-medium"
                  : "text-earth-400 hover:text-earth-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        </div>

        <div className="flex md:hidden items-center gap-1">
          <Link
            href="/buy"
            className="relative p-2 text-earth-500"
            aria-label="Cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-earth-600 text-cream-50 text-[9px] font-medium flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            className="p-2 text-earth-600"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="sr-only">{mobileOpen ? "Close" : "Open"} menu</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-earth-200/30 bg-cream-50"
          >
            <div className="px-5 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-base ${
                    pathname === link.href
                      ? "text-earth-600 font-medium"
                      : "text-earth-400"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
