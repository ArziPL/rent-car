export default function ReservationsLoading() {
  return (
    <div className="mx-auto max-w-8xl animate-pulse px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2">
        <div className="h-7 w-40 rounded-md bg-zinc-200" />
        <div className="h-3 w-56 rounded-md bg-zinc-100" />
      </div>

      {/* Tab pills */}
      <div className="mb-5 flex gap-2">
        {[80, 64, 80, 76, 72].map((w, i) => (
          <div key={i} className={`h-8 w-${w === 80 ? "20" : w === 64 ? "16" : "18"} rounded-full bg-zinc-200`} style={{ width: w }} />
        ))}
      </div>

      {/* Reservation card skeletons */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4"
          >
            {/* Image placeholder */}
            <div className="aspect-[4/3] h-24 w-24 shrink-0 rounded-lg bg-zinc-200" />
            {/* Content */}
            <div className="flex flex-1 flex-col gap-2 py-1">
              <div className="h-4 w-36 rounded-md bg-zinc-200" />
              <div className="h-3 w-24 rounded-md bg-zinc-100" />
              <div className="h-3 w-48 rounded-md bg-zinc-100" />
              <div className="mt-1 flex gap-2">
                <div className="h-5 w-20 rounded-full bg-zinc-100" />
                <div className="h-5 w-16 rounded-full bg-zinc-100" />
              </div>
            </div>
            {/* Price + action */}
            <div className="flex flex-col items-end gap-2">
              <div className="h-5 w-16 rounded-md bg-zinc-200" />
              <div className="h-8 w-20 rounded-md bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
