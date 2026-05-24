"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { useCreateReservation } from "@/hooks/useReservations";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/types/api";

interface VehicleDetailBookingProps {
  vehicle: Vehicle;
}

export function VehicleDetailBooking({ vehicle }: VehicleDetailBookingProps) {
  const role = useAuthStore((s) => s.role);
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const { mutate: createReservation, isPending } = useCreateReservation();

  function handleBook() {
    if (!role) {
      router.push("/login");
      return;
    }
    setBookingError(null);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setBookingError(null);
  }

  function handleConfirm(startDate: string, endDate: string) {
    setBookingError(null);
    createReservation(
      { vehicleId: vehicle.id, startDate, endDate },
      {
        onSuccess: () => {
          setOpen(false);
          router.push("/reservations");
        },
        onError: (err) => {
          setBookingError(
            err instanceof Error ? err.message : "Booking failed. Please try again."
          );
        },
      }
    );
  }

  if (!vehicle.available) {
    return (
      <p className="text-sm text-zinc-400">
        This vehicle is currently unavailable for booking.
      </p>
    );
  }

  return (
    <>
      {role === null ? (
        <Button variant="outline" className="w-full" onClick={handleBook}>
          Log in to book
        </Button>
      ) : (
        <Button variant="default" className="w-full" onClick={handleBook}>
          Book this vehicle
        </Button>
      )}

      <ReservationForm
        open={open}
        onClose={handleClose}
        vehicle={vehicle}
        onConfirm={handleConfirm}
        isLoading={isPending}
        error={bookingError}
      />
    </>
  );
}
