"use client";

import { useState } from "react";
import { useReservations, useCancelReservation } from "@/hooks/useReservations";
import { ReservationCard } from "@/components/reservations/ReservationCard";
import type { ReservationStatus } from "@/types/api";

const TABS: Array<{ label: string; value: ReservationStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

// We use vehicleType = "CAR" as fallback since we only have the ID from the reservation.
// In a real app we'd join with vehicle data. For now we pass type via the reservation.
// NOTE: The backend ReservationResponse doesn't include vehicleType, so we default to CAR.
// TODO: Enhance backend to include vehicle type in reservation response if needed.
const FALLBACK_TYPE = "CAR" as const;

export default function ReservationsPage() {
  const [tab, setTab] = useState<ReservationStatus | "ALL">("ALL");
  const { data: reservations, isLoading, error } = useReservations();
  const { mutate: cancel, isPending: isCancelling, variables: cancellingId } = useCancelReservation();

  const filtered = (reservations ?? []).filter(
    (r) => tab === "ALL" || r.status === tab
  );

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <div className="mb-7">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Account
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900">
          My Reservations
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track upcoming trips and review past bookings.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex items-center gap-1 border-b border-zinc-200">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`relative px-4 py-2.5 text-sm font-medium transition ${
              tab === value ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {label}
            {tab === value && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-zinc-900" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && (
        <div className="py-16 text-center text-sm text-zinc-500">Loading…</div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load reservations.
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              vehicleType={FALLBACK_TYPE}
              onCancel={() => cancel(r.id)}
              isCancelling={isCancelling && cancellingId === r.id}
            />
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-white py-16 text-center text-sm text-zinc-500">
              No reservations in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
