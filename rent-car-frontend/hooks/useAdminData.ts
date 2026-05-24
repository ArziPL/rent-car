"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import type {
  AdminReservationResponse,
  UpdateReservationStatusRequest,
  Vehicle,
  CarRequest,
  MotorbikeRequest,
  VehicleReportResponse,
} from "@/types/api";

// ── Admin Reservations ────────────────────────────────────────────────────
export function useAdminReservations() {
  return useQuery({
    queryKey: ["admin", "reservations"],
    queryFn: () =>
      clientFetch<AdminReservationResponse[]>("/api/admin/reservations"),
  });
}

export function useUpdateReservationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: UpdateReservationStatusRequest["status"] }) =>
      clientFetch<AdminReservationResponse>(
        `/api/admin/reservations/${id}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "reservations"] });
    },
  });
}

// ── Admin Vehicles ────────────────────────────────────────────────────────
export function useAdminVehicles() {
  return useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: async () => {
      const [cars, motorbikes] = await Promise.all([
        clientFetch<Vehicle[]>("/api/vehicles/cars"),
        clientFetch<Vehicle[]>("/api/vehicles/motorbikes"),
      ]);
      return [...cars, ...motorbikes] as Vehicle[];
    },
  });
}

export function useCreateCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CarRequest) =>
      clientFetch<Vehicle>("/api/admin/vehicles/cars", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vehicles"] }),
  });
}

export function useUpdateCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CarRequest }) =>
      clientFetch<Vehicle>(`/api/admin/vehicles/cars/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vehicles"] }),
  });
}

export function useCreateMotorbike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MotorbikeRequest) =>
      clientFetch<Vehicle>("/api/admin/vehicles/motorbikes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vehicles"] }),
  });
}

export function useUpdateMotorbike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MotorbikeRequest }) =>
      clientFetch<Vehicle>(`/api/admin/vehicles/motorbikes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vehicles"] }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      clientFetch<void>(`/api/admin/vehicles/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vehicles"] }),
  });
}

// ── Admin Report ──────────────────────────────────────────────────────────
export function useVehicleReport() {
  return useQuery({
    queryKey: ["admin", "report"],
    queryFn: () =>
      clientFetch<VehicleReportResponse[]>("/api/admin/report/vehicles"),
  });
}
