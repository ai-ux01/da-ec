export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 pt-16">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-earth-300 border-t-earth-600 animate-spin"
          aria-hidden
        />
        <p className="text-earth-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}
