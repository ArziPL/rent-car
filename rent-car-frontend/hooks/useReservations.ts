"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/api/client";
import type { ReservationResponse, ReservationRequest } from "@/types/api";

export function useReservations() {
  return useQuery({
    queryKey: ["reservations"],
    queryFn: () => clientFetch<ReservationResponse[]>("/api/reservations"),
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReservationRequest) =>
      clientFetch<ReservationResponse>("/api/reservations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      clientFetch<void>(`/api/reservations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
