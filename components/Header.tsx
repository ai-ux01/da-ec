"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CheckoutPanel } from "@/components/CheckoutPanel";
import { LoginModal } from "@/components/LoginModal";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/process", label: "Our Process" },
  { href: "/lab-reports", label: "Lab Reports" },
  { href: "/about", label: "About Founder" },
  { href: "/buy", label: "Buy Now" },
  // { href: "/orders", label: "My orders" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRefDesktop = useRef<HTMLDivElement>(null);
  const cartRefMobile = useRef<HTMLDivElement>(null);
  const { cart, totalItems } = useCart();
  const { isLoggedIn, logout, customer } = useAuth();
  const reduceMotion = useReducedMotion();
  const [userOpen, setUserOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  // No document listener: use backdrop for "click outside" so button clicks inside dropdown don't close

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-cream-50/95 backdrop-blur-sm border-b border-earth-200/30 overflow-visible"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16 sm:h-20">
        <Link
          href="/"
          className="font-serif text-xl sm:text-2xl font-semibold text-earth-600 tracking-tight hover:text-earth-500 transition-colors duration-300"
        >
          AMRYTUM
        </Link>

        <div className="hidden md:flex items-center gap-8 overflow-visible">
        <div className="relative" ref={cartRefDesktop}>
          <button
            type="button"
            onClick={() => {
              setUserOpen(false);
              setCartOpen((o) => !o);
            }}
            className="relative p-2 text-earth-400 hover:text-earth-600 transition-colors cursor-pointer"
            aria-label="Cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={reduceMotion ? undefined : { scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-earth-600 text-cream-50 text-[10px] font-medium flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
            )}
          </button>
          <AnimatePresence>
            {cartOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close cart"
                  onClick={() => setCartOpen(false)}
                  className="fixed inset-0 z-40 bg-transparent"
                />
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-[calc(100vw-2rem)] max-w-md max-h-[85vh] rounded-lg border border-earth-200 bg-cream-50 shadow-lg z-50 overflow-hidden flex flex-col"
                >
                <div className="flex items-center justify-between p-3 border-b border-earth-200/50 shrink-0">
                  <span className="text-sm font-medium text-earth-600">Cart{totalItems > 0 ? ` (${totalItems} ${totalItems === 1 ? "item" : "items"})` : ""}</span>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="p-1.5 text-earth-400 hover:text-earth-600 transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>
                  <CheckoutPanel
                    onClose={() => setCartOpen(false)}
                    onDone={() => setCartOpen(false)}
                    compact
                  />
                </div>
              </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <nav className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wide transition-colors duration-300 border-b-2 border-transparent hover:border-earth-300 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-50 rounded ${
                pathname === link.href
                  ? "text-earth-600 font-medium border-earth-600"
                  : "text-earth-400 hover:text-earth-600 hover:border-earth-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="relative z-10 shrink-0" ref={userRef}>
            {isLoggedIn ? (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCartOpen(false);
                  setTimeout(() => setUserOpen((prev) => !prev), 0);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex items-center gap-1.5 text-sm tracking-wide text-earth-400 hover:text-earth-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-50 rounded py-1 cursor-pointer min-h-[2.25rem]"
                aria-expanded={userOpen}
                aria-haspopup="true"
                aria-label="Account menu"
              >
                <span className="hidden sm:inline whitespace-nowrap">
                  {customer?.name?.trim() || (customer?.phone ? `+91 ${customer.phone}` : "Account")}
                </span>
                <svg className="w-5 h-5 text-earth-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <svg className={`w-4 h-4 text-earth-400 transition-transform shrink-0 ${userOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCartOpen(false);
                  setLoginModalOpen(true);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex items-center gap-1.5 text-sm tracking-wide text-earth-400 hover:text-earth-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-50 rounded py-1 cursor-pointer min-h-[2.25rem]"
                aria-haspopup="dialog"
                aria-label="Open login"
              >
                <span className="hidden sm:inline whitespace-nowrap">Login</span>
                <svg className="w-5 h-5 text-earth-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            )}
            <AnimatePresence>
              {userOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setUserOpen(false)}
                    className="fixed inset-0 z-[100] bg-transparent"
                  />
                  <motion.div
                    key="account-menu"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 min-w-[180px] rounded-lg border border-earth-200 bg-cream-50 shadow-dropdown z-[101] py-1"
                    role="menu"
                  >
                    <>
                      <div className="px-3 py-2 border-b border-earth-200/50">
                        <p className="text-xs text-earth-500 truncate">
                          {customer?.phone ? `+91 ${customer.phone}` : "Signed in"}
                        </p>
                      </div>
                      <Link
                        href="/orders"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-earth-600 hover:bg-earth-200/30 transition-colors"
                        role="menuitem"
                      >
                        <svg className="w-4 h-4 text-earth-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        My orders
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setUserOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-earth-600 hover:bg-earth-200/30 transition-colors text-left"
                        role="menuitem"
                      >
                        <svg className="w-4 h-4 text-earth-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </nav>
        </div>

        <div className="flex md:hidden items-center gap-1">
          <div className="relative" ref={cartRefMobile}>
            <button
              type="button"
              onClick={() => setCartOpen((o) => !o)}
              className="relative p-2 text-earth-500"
              aria-label="Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={reduceMotion ? undefined : { scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-earth-600 text-cream-50 text-[9px] font-medium flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
            <AnimatePresence>
              {cartOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close cart"
                    onClick={() => setCartOpen(false)}
                    className="fixed inset-0 z-40 bg-transparent"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-[calc(100vw-2rem)] max-w-md max-h-[85vh] rounded-lg border border-earth-200 bg-cream-50 shadow-lg z-50 overflow-hidden flex flex-col"
                  >
                    <div className="flex items-center justify-between p-3 border-b border-earth-200/50 shrink-0">
                      <span className="text-sm font-medium text-earth-600">Cart{totalItems > 0 ? ` (${totalItems} ${totalItems === 1 ? "item" : "items"})` : ""}</span>
                      <button
                        type="button"
                        onClick={() => setCartOpen(false)}
                        className="p-1.5 text-earth-400 hover:text-earth-600 transition-colors"
                        aria-label="Close"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="overflow-y-auto flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>
                      <CheckoutPanel
                        onClose={() => setCartOpen(false)}
                        onDone={() => setCartOpen(false)}
                        compact
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
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
              {isLoggedIn ? (
                <>
                  <div className="border-t border-earth-200/40 pt-3 mt-1">
                    <p className="text-xs text-earth-500 mb-2">
                      {customer?.phone ? `Signed in · +91 ${customer.phone}` : "Signed in"}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="text-base text-earth-400 text-left hover:text-earth-600"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="text-base text-earth-400 text-left hover:text-earth-600"
                >
                  Login
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => setLoginModalOpen(false)}
      />
    </header>
  );
}
