"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { VehicleFilters, type VehicleTypeFilter, type VehicleSortOrder } from "@/components/vehicles/VehicleFilters";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { useAuthStore } from "@/lib/store/auth";
import { useCreateReservation } from "@/hooks/useReservations";
import type { Vehicle } from "@/types/api";

interface VehicleGridProps {
  initialVehicles: Vehicle[];
}

export function VehicleGrid({ initialVehicles }: VehicleGridProps) {
  const role = useAuthStore((s) => s.role);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<VehicleTypeFilter>("ALL");
  const [sort, setSort] = useState<VehicleSortOrder>("priceAsc");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [bookVehicle, setBookVehicle] = useState<Vehicle | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const { mutate: createReservation, isPending } = useCreateReservation();

  const filtered = useMemo(() => {
    let list = initialVehicles.filter((v) => filter === "ALL" || v.type === filter);
    if (availableOnly) list = list.filter((v) => v.available);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((v) =>
        `${v.brand} ${v.model}`.toLowerCase().includes(q)
      );
    }
    const comparators: Record<VehicleSortOrder, (a: Vehicle, b: Vehicle) => number> = {
      priceAsc: (a, b) => a.pricePerDay - b.pricePerDay,
      priceDesc: (a, b) => b.pricePerDay - a.pricePerDay,
      yearDesc: (a, b) => b.year - a.year,
    };
    return [...list].sort(comparators[sort]);
  }, [initialVehicles, query, filter, sort, availableOnly]);

  const uiRole: "guest" | "user" | "admin" = role === "ADMIN" ? "admin" : role === "USER" ? "user" : "guest";

  function handleClose() {
    setBookVehicle(null);
    setBookingError(null);
  }

  function handleConfirm(startDate: string, endDate: string) {
    if (!bookVehicle) return;
    setBookingError(null);
    createReservation(
      { vehicleId: bookVehicle.id, startDate, endDate },
      {
        onSuccess: () => {
          setBookVehicle(null);
          router.push("/reservations");
        },
        onError: (err) => {
          setBookingError(err instanceof Error ? err.message : "Booking failed. Please try again.");
        },
      }
    );
  }

  function handleBook(vehicle: Vehicle) {
    if (!role) {
      router.push("/login");
      return;
    }
    setBookVehicle(vehicle);
  }

  return (
    <>
      <VehicleFilters
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        availableOnly={availableOnly}
        onAvailableOnlyChange={setAvailableOnly}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((v) => (
          <VehicleCard
            key={v.id}
            vehicle={v}
            role={uiRole}
            onBook={() => handleBook(v)}
            onViewDetail={() => router.push(`/vehicles/${v.id}`)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white py-16 text-center text-sm text-zinc-500">
          No vehicles match your filters.
        </div>
      )}

      <ReservationForm
        open={!!bookVehicle}
        onClose={handleClose}
        vehicle={bookVehicle}
        onConfirm={handleConfirm}
        isLoading={isPending}
        error={bookingError}
      />
    </>
  );
}
