"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import type { CarRequest, Vehicle } from "@/types/api";

interface CarFormProps {
  open: boolean;
  onClose: () => void;
  existing?: Vehicle | null;
  onSave: (data: CarRequest) => void;
  isLoading?: boolean;
}

const BLANK: CarRequest = {
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  engineCc: 1600,
  pricePerDay: 60,
  numSeats: 5,
  transmission: "AUTOMATIC",
  fuelType: "PETROL",
  available: true,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function CarForm({ open, onClose, existing, onSave, isLoading }: CarFormProps) {
  const [form, setForm] = useState<CarRequest>(BLANK);

  useEffect(() => {
    if (open) {
      if (existing && existing.type === "CAR") {
        setForm({
          brand: existing.brand,
          model: existing.model,
          year: existing.year,
          engineCc: existing.engineCc,
          pricePerDay: existing.pricePerDay,
          numSeats: existing.numSeats,
          transmission: existing.transmission,
          fuelType: existing.fuelType,
          available: existing.available,
        });
      } else {
        setForm(BLANK);
      }
    }
  }, [open, existing]);

  const set = <K extends keyof CarRequest>(k: K, v: CarRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit Car" : "Add New Car"}</DialogTitle>
          <DialogDescription>
            {existing
              ? `Updating ${existing.brand} ${existing.model}`
              : "Fill in car details"}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <Field label="Brand">
              <Input
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="Toyota"
              />
            </Field>
            <Field label="Model">
              <Input
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                placeholder="Corolla"
              />
            </Field>
            <Field label="Year">
              <Input
                type="number"
                value={form.year}
                onChange={(e) => set("year", +e.target.value)}
              />
            </Field>
            <Field label="Engine (cc)">
              <Input
                type="number"
                value={form.engineCc}
                onChange={(e) => set("engineCc", +e.target.value)}
              />
            </Field>
            <Field label="Price per day (€)">
              <Input
                type="number"
                value={form.pricePerDay}
                onChange={(e) => set("pricePerDay", +e.target.value)}
              />
            </Field>
            <Field label="Seats">
              <Select
                value={String(form.numSeats)}
                onChange={(e) => set("numSeats", +e.target.value)}
              >
                {[2, 4, 5, 7].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Transmission">
              <Select
                value={form.transmission}
                onChange={(e) => set("transmission", e.target.value as CarRequest["transmission"])}
              >
                <option value="AUTOMATIC">Automatic</option>
                <option value="MANUAL">Manual</option>
              </Select>
            </Field>
            <Field label="Fuel type">
              <Select
                value={form.fuelType}
                onChange={(e) => set("fuelType", e.target.value as CarRequest["fuelType"])}
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
              </Select>
            </Field>
            <Field label="Available">
              <Select
                value={form.available ? "1" : "0"}
                onChange={(e) => set("available", e.target.value === "1")}
              >
                <option value="1">Yes</option>
                <option value="0">No</option>
              </Select>
            </Field>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!form.brand || !form.model || isLoading}
            onClick={() => onSave(form)}
          >
            {isLoading ? "Saving…" : existing ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
