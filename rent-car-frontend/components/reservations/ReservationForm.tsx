"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { calculatePrice, daysBetween, formatPrice } from "@/lib/utils";
import type { Vehicle } from "@/types/api";

interface ReservationFormProps {
  open: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onConfirm: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function ReservationForm({
  open,
  onClose,
  vehicle,
  onConfirm,
  isLoading = false,
  error,
}: ReservationFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    if (open) {
      const t1 = new Date();
      t1.setDate(t1.getDate() + 1);
      const t2 = new Date();
      t2.setDate(t2.getDate() + 4);
      setStart(t1.toISOString().slice(0, 10));
      setEnd(t2.toISOString().slice(0, 10));
    }
  }, [open]);

  if (!vehicle) return null;

  const days = start && end ? daysBetween(start, end) : 0;
  const total = start && end && days > 0 ? calculatePrice(start, end, vehicle.pricePerDay) : 0;
  const canSubmit = !!start && !!end && days >= 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Book this vehicle</DialogTitle>
          <DialogDescription>
            {vehicle.brand} {vehicle.model} · {vehicle.year}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {/* Vehicle preview */}
          <div className="flex gap-4">
            <VehicleImage
              type={vehicle.type}
              brand={vehicle.brand}
              model={vehicle.model}
              className="h-28 w-40 shrink-0"
            />
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={vehicle.type === "CAR" ? "car" : "motorbike"}>
                  {vehicle.type}
                </Badge>
                <Badge variant="available">Available</Badge>
              </div>
              <div className="mt-1 text-zinc-600">
                {vehicle.type === "CAR"
                  ? `${vehicle.numSeats} seats · ${vehicle.transmission} · ${vehicle.fuelType}`
                  : `License ${vehicle.licenseCategory} · ${vehicle.motorbikeType} · ${
                      vehicle.abs ? "ABS" : "No ABS"
                    }`}
              </div>
              <div className="mt-1 text-zinc-900">
                <span className="font-semibold tabular-nums">
                  €{vehicle.pricePerDay}
                </span>{" "}
                <span className="text-xs text-zinc-500">/ day</span>
              </div>
              <div className="text-[10px] text-zinc-400">
                Weekend days charged at 1.5×
              </div>
            </div>
          </div>

          {/* Booking error */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Date pickers */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="start-date">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Pick-up date
                </span>
              </Label>
              <Input
                id="start-date"
                type="date"
                min={today}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="end-date">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Return date
                </span>
              </Label>
              <Input
                id="end-date"
                type="date"
                min={start || today}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          {/* Price preview */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3">
            <div className="text-sm text-zinc-600">
              {days > 0
                ? `${days} day${days === 1 ? "" : "s"} × €${vehicle.pricePerDay}/day`
                : "Pick a date range"}
            </div>
            <div className="text-lg font-semibold tabular-nums text-zinc-900">
              {total > 0 ? formatPrice(total) : "—"}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!canSubmit || isLoading}
            onClick={() => onConfirm(start, end)}
          >
            {isLoading ? "Booking…" : `Confirm · ${total > 0 ? formatPrice(total) : "—"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
