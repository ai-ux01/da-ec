"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-earth-200/40 bg-cream-100/50 mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
          <div>
            <Link
              href="/"
              className="font-serif text-xl font-semibold text-earth-600"
            >
              AMRYTUM
            </Link>
            <p className="mt-2 text-sm text-earth-400 max-w-xs">
              Small batch A2 desi cow ghee. From farm to jar. No shortcuts.
            </p>
          </div>
          <nav className="flex flex-col gap-3">
            <Link
              href="/process"
              className="text-sm text-earth-400 hover:text-earth-600 transition-colors"
            >
              Our Process
            </Link>
            <Link
              href="/lab-reports"
              className="text-sm text-earth-400 hover:text-earth-600 transition-colors"
            >
              Lab Reports
            </Link>
            <Link
              href="/about"
              className="text-sm text-earth-400 hover:text-earth-600 transition-colors"
            >
              About Founder
            </Link>
            <Link
              href="/buy"
              className="text-sm text-earth-400 hover:text-earth-600 transition-colors"
            >
              Buy Now
            </Link>
          </nav>
        </div>
        <div className="mt-12 pt-8 border-t border-earth-200/30">
          <p className="text-xs text-earth-300">
            © {new Date().getFullYear()} AMRYTUM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
