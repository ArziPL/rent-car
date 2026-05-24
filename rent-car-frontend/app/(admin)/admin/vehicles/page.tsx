"use client";

import { useState } from "react";
import { Car, Bike, Pencil, Trash2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { CarForm } from "@/components/vehicles/CarForm";
import { MotorbikeForm } from "@/components/vehicles/MotorbikeForm";
import {
  useAdminVehicles,
  useCreateCar, useUpdateCar,
  useCreateMotorbike, useUpdateMotorbike,
  useDeleteVehicle,
} from "@/hooks/useAdminData";
import type { Vehicle, CarRequest, MotorbikeRequest } from "@/types/api";

type FilterType = "ALL" | "CAR" | "MOTORBIKE";

export default function AdminVehiclesPage() {
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [carFormOpen, setCarFormOpen] = useState(false);
  const [bikeFormOpen, setBikeFormOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  const { data: vehicles, isLoading } = useAdminVehicles();
  const { mutate: createCar, isPending: creatingCar } = useCreateCar();
  const { mutate: updateCar, isPending: updatingCar } = useUpdateCar();
  const { mutate: createBike, isPending: creatingBike } = useCreateMotorbike();
  const { mutate: updateBike, isPending: updatingBike } = useUpdateMotorbike();
  const { mutate: deleteVehicle, isPending: deleting } = useDeleteVehicle();

  const list = (vehicles ?? []).filter(
    (v) => filter === "ALL" || v.type === filter
  );

  function handleCarSave(data: CarRequest) {
    if (editVehicle) {
      updateCar({ id: editVehicle.id, data }, { onSuccess: () => { setCarFormOpen(false); setEditVehicle(null); } });
    } else {
      createCar(data, { onSuccess: () => setCarFormOpen(false) });
    }
  }

  function handleBikeSave(data: MotorbikeRequest) {
    if (editVehicle) {
      updateBike({ id: editVehicle.id, data }, { onSuccess: () => { setBikeFormOpen(false); setEditVehicle(null); } });
    } else {
      createBike(data, { onSuccess: () => setBikeFormOpen(false) });
    }
  }

  function handleEdit(v: Vehicle) {
    setEditVehicle(v);
    if (v.type === "CAR") setCarFormOpen(true);
    else setBikeFormOpen(true);
  }

  function handleAdd(type: "CAR" | "MOTORBIKE") {
    setEditVehicle(null);
    if (type === "CAR") setCarFormOpen(true);
    else setBikeFormOpen(true);
  }

  return (
    <div className="px-7 py-7">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Admin
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900">
            Vehicles
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Add, edit and manage the fleet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Type filter pills */}
          <div className="flex items-center gap-1 rounded-md bg-zinc-100 p-0.5">
            {(["ALL", "CAR", "MOTORBIKE"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                  filter === f
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {f === "ALL" ? "All" : f === "CAR" ? "Cars" : "Motorbikes"}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={() => handleAdd("MOTORBIKE")}>
            <Bike className="h-4 w-4" /> Add Motorbike
          </Button>
          <Button variant="primary" onClick={() => handleAdd("CAR")}>
            <Plus className="h-4 w-4" /> Add Car
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="py-16 text-center text-sm text-zinc-500">Loading…</div>
      )}

      {!isLoading && (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Specs</TableHead>
                <TableHead className="text-right">€ / day</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="grid h-9 w-12 place-items-center rounded-md bg-zinc-100 text-zinc-500">
                      {v.type === "CAR" ? (
                        <Car className="h-4 w-4" />
                      ) : (
                        <Bike className="h-4 w-4" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-zinc-900">
                      {v.brand} {v.model}
                    </div>
                    <div className="text-[11px] text-zinc-400">ID #{v.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={v.type === "CAR" ? "car" : "motorbike"}>
                      {v.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{v.year}</TableCell>
                  <TableCell>
                    <div className="text-[12px] text-zinc-600">
                      {v.type === "CAR"
                        ? `${v.numSeats} seats · ${v.transmission} · ${v.fuelType}`
                        : `Lic. ${v.licenseCategory} · ${v.motorbikeType} · ${
                            v.abs ? "ABS" : "No ABS"
                          }`}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    €{v.pricePerDay}
                  </TableCell>
                  <TableCell>
                    <button
                      title={v.available ? "Mark unavailable" : "Mark available"}
                      onClick={() => {
                        if (v.type === "CAR") {
                          updateCar({
                            id: v.id,
                            data: {
                              brand: v.brand, model: v.model, year: v.year,
                              engineCc: v.engineCc, pricePerDay: v.pricePerDay,
                              numSeats: v.numSeats, transmission: v.transmission, fuelType: v.fuelType,
                              available: !v.available,
                            },
                          });
                        } else {
                          updateBike({
                            id: v.id,
                            data: {
                              brand: v.brand, model: v.model, year: v.year,
                              engineCc: v.engineCc, pricePerDay: v.pricePerDay,
                              licenseCategory: v.licenseCategory, motorbikeType: v.motorbikeType, abs: v.abs,
                              available: !v.available,
                            },
                          });
                        }
                      }}
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        v.available ? "bg-emerald-500" : "bg-zinc-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                          v.available ? "left-[18px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(v)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteVehicle(v.id)}
                        disabled={deleting}
                        title="Delete"
                        className="hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {list.length === 0 && (
            <div className="py-12 text-center text-sm text-zinc-500">
              No vehicles found.
            </div>
          )}
        </Card>
      )}

      <CarForm
        open={carFormOpen}
        onClose={() => { setCarFormOpen(false); setEditVehicle(null); }}
        existing={editVehicle}
        onSave={handleCarSave}
        isLoading={creatingCar || updatingCar}
      />
      <MotorbikeForm
        open={bikeFormOpen}
        onClose={() => { setBikeFormOpen(false); setEditVehicle(null); }}
        existing={editVehicle}
        onSave={handleBikeSave}
        isLoading={creatingBike || updatingBike}
      />
    </div>
  );
}
