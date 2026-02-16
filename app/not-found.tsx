import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 pt-16 bg-cream-50">
      <div className="max-w-md w-full text-center">
        <h1 className="font-serif text-display-md text-earth-600">Page not found</h1>
        <p className="mt-3 text-earth-500 text-sm">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center font-medium tracking-wide border border-earth-600 bg-earth-600 text-cream-50 px-6 py-3 text-sm rounded-lg hover:bg-earth-500 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/buy"
            className="inline-flex items-center justify-center font-medium tracking-wide border border-earth-400 text-earth-600 px-6 py-3 text-sm rounded-lg hover:border-earth-600 hover:bg-earth-200/10 transition-colors"
          >
            Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
