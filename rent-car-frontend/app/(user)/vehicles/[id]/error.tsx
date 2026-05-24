"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VehicleDetailError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-500">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900">Failed to load vehicle</h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        {error.message || "An unexpected error occurred while loading this vehicle."}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Link href="/vehicles" className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700">
          Back to vehicles
        </Link>
      </div>
    </div>
  );
}
