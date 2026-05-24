import { serverFetch } from "@/lib/api/server";
import type { Vehicle } from "@/types/api";
import { VehicleGrid } from "./VehicleGrid";

export const revalidate = 60; // Re-validate every 60 seconds

export default async function VehiclesPage() {
  let vehicles: Vehicle[] = [];
  try {
    // Fetch cars and motorbikes in parallel — each endpoint returns the full typed DTO
    const [cars, motorbikes] = await Promise.all([
      serverFetch<Vehicle[]>("/api/vehicles/cars"),
      serverFetch<Vehicle[]>("/api/vehicles/motorbikes"),
    ]);
    vehicles = [...cars, ...motorbikes];
  } catch {
    // Show empty state on error
  }

  return (
    <div className="mx-auto max-w-8xl px-6 py-8">
      {/* Hero */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Fleet · Available now
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900">
            Pick your ride
          </h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-500">
            Browse our fleet of cars and motorbikes. Log in to book.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {vehicles.filter((v) => v.available).length} available · {vehicles.length} total
        </div>
      </div>

      <VehicleGrid initialVehicles={vehicles} />
    </div>
  );
}
