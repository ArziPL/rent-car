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
import type { MotorbikeRequest, Vehicle } from "@/types/api";

interface MotorbikeFormProps {
  open: boolean;
  onClose: () => void;
  existing?: Vehicle | null;
  onSave: (data: MotorbikeRequest) => void;
  isLoading?: boolean;
}

const BLANK: MotorbikeRequest = {
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  engineCc: 400,
  pricePerDay: 50,
  licenseCategory: "A2",
  motorbikeType: "NAKED",
  abs: true,
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

export function MotorbikeForm({
  open,
  onClose,
  existing,
  onSave,
  isLoading,
}: MotorbikeFormProps) {
  const [form, setForm] = useState<MotorbikeRequest>(BLANK);

  useEffect(() => {
    if (open) {
      if (existing && existing.type === "MOTORBIKE") {
        setForm({
          brand: existing.brand,
          model: existing.model,
          year: existing.year,
          engineCc: existing.engineCc,
          pricePerDay: existing.pricePerDay,
          licenseCategory: existing.licenseCategory,
          motorbikeType: existing.motorbikeType,
          abs: existing.abs,
          available: existing.available,
        });
      } else {
        setForm(BLANK);
      }
    }
  }, [open, existing]);

  const set = <K extends keyof MotorbikeRequest>(k: K, v: MotorbikeRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>
            {existing ? "Edit Motorbike" : "Add New Motorbike"}
          </DialogTitle>
          <DialogDescription>
            {existing
              ? `Updating ${existing.brand} ${existing.model}`
              : "Fill in motorbike details"}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <Field label="Brand">
              <Input
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="Yamaha"
              />
            </Field>
            <Field label="Model">
              <Input
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                placeholder="MT-07"
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
            <Field label="License category">
              <Select
                value={form.licenseCategory}
                onChange={(e) =>
                  set("licenseCategory", e.target.value as MotorbikeRequest["licenseCategory"])
                }
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="A">A</option>
              </Select>
            </Field>
            <Field label="Type">
              <Select
                value={form.motorbikeType}
                onChange={(e) =>
                  set("motorbikeType", e.target.value as MotorbikeRequest["motorbikeType"])
                }
              >
                <option value="NAKED">Naked</option>
                <option value="SPORT">Sport</option>
                <option value="SCOOTER">Scooter</option>
                <option value="CRUISER">Cruiser</option>
              </Select>
            </Field>
            <Field label="ABS">
              <Select
                value={form.abs ? "1" : "0"}
                onChange={(e) => set("abs", e.target.value === "1")}
              >
                <option value="1">Yes</option>
                <option value="0">No</option>
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
