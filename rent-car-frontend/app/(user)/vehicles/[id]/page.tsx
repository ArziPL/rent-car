import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Calendar, Gauge, Fuel, Users, Settings2, BadgeCheck, ShieldCheck, Zap } from "lucide-react";
import { serverFetch } from "@/lib/api/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { VehicleDetailBooking } from "./VehicleDetailBooking";
import { formatPrice } from "@/lib/utils";
import type { Car, Motorbike, Vehicle } from "@/types/api";
import type { Metadata } from "next";

export const revalidate = 60;

async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  const [car, bike] = await Promise.allSettled([
    serverFetch<Car>(`/api/vehicles/cars/${id}`),
    serverFetch<Motorbike>(`/api/vehicles/motorbikes/${id}`),
  ]);
  if (car.status === "fulfilled") return car.value;
  if (bike.status === "fulfilled") return bike.value;
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await fetchVehicleById(id);
  if (!vehicle) return { title: "Vehicle not found — RentCar" };
  return { title: `${vehicle.brand} ${vehicle.model} — RentCar` };
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await fetchVehicleById(id);
  if (!vehicle) notFound();

  const isCar = vehicle.type === "CAR";

  const specs = isCar
    ? [
        { Icon: Users, label: "Seats", value: `${vehicle.numSeats}` },
        { Icon: Settings2, label: "Transmission", value: vehicle.transmission },
        { Icon: Fuel, label: "Fuel type", value: vehicle.fuelType },
        { Icon: Gauge, label: "Engine", value: `${vehicle.engineCc} cc` },
      ]
    : [
        { Icon: BadgeCheck, label: "License", value: `Category ${vehicle.licenseCategory}` },
        { Icon: Gauge, label: "Type", value: vehicle.motorbikeType },
        { Icon: ShieldCheck, label: "ABS", value: vehicle.abs ? "Yes" : "No" },
        { Icon: Zap, label: "Engine", value: `${vehicle.engineCc} cc` },
      ];

  return (
    <div className="mx-auto max-w-8xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-zinc-400">
        <Link href="/vehicles" className="hover:text-zinc-700 transition">
          Vehicles
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 font-medium">
          {vehicle.brand} {vehicle.model}
        </span>
      </nav>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* ── Left: image + specs ───────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Image with badges */}
          <div className="relative overflow-hidden rounded-xl">
            <VehicleImage
              type={vehicle.type}
              brand={vehicle.brand}
              model={vehicle.model}
              className="aspect-[16/9] w-full"
            />
            <div className="absolute left-4 top-4 flex gap-1.5">
              <Badge variant={isCar ? "car" : "motorbike"}>
                {vehicle.type}
              </Badge>
            </div>
            <div className="absolute right-4 top-4">
              <Badge variant={vehicle.available ? "available" : "unavailable"}>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    vehicle.available ? "bg-emerald-500" : "bg-zinc-400"
                  }`}
                />
                {vehicle.available ? "Available" : "Unavailable"}
              </Badge>
            </div>
          </div>

          {/* Specs card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-700">
                Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {specs.map(({ Icon, label, value }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </dt>
                    <dd className="text-sm font-semibold text-zinc-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: booking panel ──────────────────────────────────── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardContent className="pt-6">
              {/* Price */}
              <div className="mb-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight text-zinc-900">
                  {formatPrice(vehicle.pricePerDay)}
                </span>
                <span className="text-sm text-zinc-400">/ day</span>
              </div>
              <p className="mb-1 text-xs text-zinc-400">
                Weekend rates ×1.5 · 24 h cancellation window
              </p>

              {/* Year */}
              <div className="mb-5 mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>Year {vehicle.year}</span>
              </div>

              {/* Booking action */}
              <VehicleDetailBooking vehicle={vehicle} />
            </CardContent>
          </Card>

          {/* Back link */}
          <Link
            href="/vehicles"
            className="mt-4 flex items-center gap-1 text-xs text-zinc-400 transition hover:text-zinc-600"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            Back to all vehicles
          </Link>
        </div>
      </div>
    </div>
  );
}
