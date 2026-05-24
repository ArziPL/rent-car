"use client";

import { Car, Bike, Users, Gauge, Fuel, ShieldCheck, BadgeCheck, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VehicleImage } from "./VehicleImage";
import type { Vehicle } from "@/types/api";

interface VehicleCardProps {
  vehicle: Vehicle;
  role: "guest" | "user" | "admin";
  onBook?: () => void;
  onViewDetail?: () => void;
}

export function VehicleCard({ vehicle, role, onBook, onViewDetail }: VehicleCardProps) {
  const isCar = vehicle.type === "CAR";

  const specs = isCar
    ? [
        { Icon: Users, label: `${vehicle.numSeats} seats` },
        { Icon: Settings2, label: vehicle.transmission },
        { Icon: Fuel, label: vehicle.fuelType },
      ]
    : [
        { Icon: BadgeCheck, label: `Lic. ${vehicle.licenseCategory}` },
        { Icon: Gauge, label: vehicle.motorbikeType },
        {
          Icon: ShieldCheck,
          label: vehicle.abs ? "ABS" : "No ABS",
          muted: !vehicle.abs,
        },
      ];

  return (
    <Card className="group flex flex-col overflow-hidden transition hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
      {/* Image */}
      <div className="relative p-3">
        <VehicleImage
          type={vehicle.type}
          brand={vehicle.brand}
          model={vehicle.model}
          className="aspect-[4/3]"
        />
        <div className="absolute left-5 top-5 flex gap-1.5">
          <Badge variant={isCar ? "car" : "motorbike"}>
            {isCar ? (
              <Car className="h-3 w-3" />
            ) : (
              <Bike className="h-3 w-3" />
            )}
            {vehicle.type}
          </Badge>
        </div>
        <div className="absolute right-5 top-5">
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

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold tracking-tight text-zinc-900">
              {vehicle.brand} {vehicle.model}
            </div>
            <div className="text-xs text-zinc-500">{vehicle.year}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[17px] font-semibold tracking-tight text-zinc-900 tabular-nums">
              €{vehicle.pricePerDay}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400">
              per day
            </div>
          </div>
        </div>

        {/* Specs */}
        <ul className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-50 p-2.5">
          {specs.map(({ Icon, label, muted }, i) => (
            <li
              key={i}
              className={`flex flex-col items-center gap-1 text-center ${
                muted ? "opacity-50" : ""
              }`}
            >
              <Icon className="h-4 w-4 text-zinc-500" />
              <span className="text-[10.5px] font-medium leading-tight text-zinc-700">
                {label}
              </span>
            </li>
          ))}
        </ul>

        {/* Action */}
        <div className="mt-1">
          {role === "user" ? (
            <Button
              variant="primary"
              className="w-full"
              disabled={!vehicle.available}
              onClick={onBook}
            >
              {vehicle.available ? "Book" : "Unavailable"}
            </Button>
          ) : role === "guest" ? (
            <Button variant="outline" className="w-full" disabled>
              Log in to book
            </Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={onViewDetail}>
              View details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
