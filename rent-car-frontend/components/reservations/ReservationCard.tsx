import { Calendar, Car, Bike } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { formatDateRange, daysBetween, formatPrice } from "@/lib/utils";
import type { ReservationResponse } from "@/types/api";

interface ReservationCardProps {
  reservation: ReservationResponse;
  vehicleType: "CAR" | "MOTORBIKE";
  onCancel?: () => void;
  isCancelling?: boolean;
}

export function ReservationCard({
  reservation,
  vehicleType,
  onCancel,
  isCancelling,
}: ReservationCardProps) {
  const { vehicleBrand, vehicleModel, startDate, endDate, status, totalPrice, id } =
    reservation;
  const days = daysBetween(startDate, endDate);

  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <VehicleImage
        type={vehicleType}
        brand={vehicleBrand}
        model={vehicleModel}
        className="h-24 w-full shrink-0 sm:w-40"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900">
            {vehicleBrand} {vehicleModel}
          </h3>
          <Badge variant={vehicleType === "CAR" ? "car" : "motorbike"}>
            {vehicleType === "CAR" ? (
              <Car className="h-3 w-3" />
            ) : (
              <Bike className="h-3 w-3" />
            )}
            {vehicleType}
          </Badge>
          <span className="text-xs text-zinc-400">·</span>
          <span className="font-mono text-[11px] text-zinc-500">#{id}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            {formatDateRange(startDate, endDate)}
          </div>
          <div className="text-zinc-400">·</div>
          <div className="text-zinc-600">
            {days} {days === 1 ? "day" : "days"}
          </div>
          <div className="text-zinc-400">·</div>
          <div className="font-medium text-zinc-900 tabular-nums">
            {formatPrice(totalPrice)}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <StatusBadge status={status} />
        {status === "PENDING" && onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling…" : "Cancel"}
          </Button>
        )}
      </div>
    </Card>
  );
}
