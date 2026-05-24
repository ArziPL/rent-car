"use client";

import { useState, useMemo } from "react";
import { Car, Bike } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/reservations/StatusBadge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { useAdminReservations, useUpdateReservationStatus } from "@/hooks/useAdminData";
import { formatDateRange, daysBetween, formatPrice } from "@/lib/utils";
import type { ReservationStatus } from "@/types/api";

type Filter = ReservationStatus | "ALL";

const NEXT_STATUS: Partial<Record<ReservationStatus, { label: string; next: ReservationStatus; variant: "primary" | "outline" }>> = {
  PENDING: { label: "Confirm", next: "CONFIRMED", variant: "primary" },
  CONFIRMED: { label: "Mark completed", next: "COMPLETED", variant: "outline" },
};

export default function AdminReservationsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const { data: reservations, isLoading } = useAdminReservations();
  const { mutate: updateStatus, isPending } = useUpdateReservationStatus();

  const counts = useMemo(() => {
    const c = { ALL: 0, PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    (reservations ?? []).forEach((r) => {
      c.ALL++;
      c[r.status]++;
    });
    return c;
  }, [reservations]);

  const list = (reservations ?? []).filter(
    (r) => filter === "ALL" || r.status === filter
  );

  return (
    <div className="px-7 py-7">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Admin
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900">
            Reservations
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage incoming requests and active rentals.
          </p>
        </div>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="w-auto min-w-[180px]"
        >
          {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All statuses" : s} ({counts[s]})
            </option>
          ))}
        </Select>
      </div>

      {/* Stat strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Pending", count: counts.PENDING, dot: "bg-amber-500" },
          { label: "Confirmed", count: counts.CONFIRMED, dot: "bg-emerald-500" },
          { label: "Completed", count: counts.COMPLETED, dot: "bg-sky-500" },
          { label: "Cancelled", count: counts.CANCELLED, dot: "bg-rose-500" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              {s.label}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums">
                {s.count}
              </div>
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
            </div>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="py-16 text-center text-sm text-zinc-500">Loading…</div>
      )}

      {!isLoading && (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reservation</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => {
                const action = NEXT_STATUS[r.status];
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <span className="font-mono text-[12px] text-zinc-500">
                        #{r.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-full bg-zinc-100 text-[10px] font-medium text-zinc-700">
                          {r.userEmail.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-zinc-900">{r.userEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {r.vehicleType === "CAR" ? (
                          <Car className="h-4 w-4 text-zinc-500" />
                        ) : (
                          <Bike className="h-4 w-4 text-zinc-500" />
                        )}
                        <span>
                          {r.vehicleBrand} {r.vehicleModel}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-zinc-700">
                        {formatDateRange(r.startDate, r.endDate)}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {daysBetween(r.startDate, r.endDate)} days
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatPrice(r.totalPrice)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {action && (
                          <Button
                            variant={action.variant}
                            size="sm"
                            disabled={isPending}
                            onClick={() =>
                              updateStatus({ id: r.id, status: action.next })
                            }
                          >
                            {action.label}
                          </Button>
                        )}
                        {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={() =>
                              updateStatus({ id: r.id, status: "CANCELLED" })
                            }
                          >
                            Cancel
                          </Button>
                        )}
                        {(r.status === "CANCELLED" || r.status === "COMPLETED") && (
                          <span className="text-[11px] text-zinc-400">—</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {list.length === 0 && (
            <div className="py-12 text-center text-sm text-zinc-500">
              No reservations found.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
