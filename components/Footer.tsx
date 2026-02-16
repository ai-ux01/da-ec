"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/lib/mockData";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-earth-200/40 bg-cream-100/50 mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
          <div>
            <Link
              href="/"
              className="font-serif text-xl font-semibold text-earth-600"
            >
              {brand.name}
            </Link>
            <p className="mt-2 text-sm text-earth-400 max-w-xs">
              {brand.subtext}
            </p>
          </div>
          <nav className="flex flex-col gap-3">
            <Link
              href="/process"
              className="text-sm text-earth-400 hover:text-earth-600 transition-colors border-b border-transparent hover:border-earth-300 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-100 rounded"
            >
              Our Process
            </Link>
            <Link
              href="/lab-reports"
              className="text-sm text-earth-400 hover:text-earth-600 transition-colors border-b border-transparent hover:border-earth-300 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-100 rounded"
            >
              Lab Reports
            </Link>
            <Link
              href="/about"
              className="text-sm text-earth-400 hover:text-earth-600 transition-colors border-b border-transparent hover:border-earth-300 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-100 rounded"
            >
              About Founder
            </Link>
            <Link
              href="/buy"
              className="text-sm text-earth-400 hover:text-earth-600 transition-colors border-b border-transparent hover:border-earth-300 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-100 rounded"
            >
              Buy Now
            </Link>
            {/* <Link
              href="/admin"
              className="text-sm text-earth-400 hover:text-earth-600 transition-colors border-b border-transparent hover:border-earth-300 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-100 rounded"
            >
              Admin
            </Link> */}
          </nav>
        </div>
        <div className="mt-12 pt-8 border-t border-earth-200/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <nav className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-earth-400">
            <Link href="/privacy" className="hover:text-earth-600 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-100 rounded">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-earth-600 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-100 rounded">
              Terms
            </Link>
            <Link href="/shipping-returns" className="hover:text-earth-600 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-100 rounded">
              Shipping & Returns
            </Link>
          </nav>
          <p className="text-xs text-earth-300">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
