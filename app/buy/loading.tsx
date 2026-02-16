export default function BuyLoading() {
  return (
    <div className="pt-16 sm:pt-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-8 h-8 rounded-full border-2 border-earth-300 border-t-earth-600 animate-spin"
            aria-hidden
          />
          <p className="text-earth-500 text-sm">Loading products…</p>
        </div>
      </div>
    </div>
  );
}
