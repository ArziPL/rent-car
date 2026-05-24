"use client";

import { Car, Bike, LayoutGrid, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export type VehicleTypeFilter = "ALL" | "CAR" | "MOTORBIKE";
export type VehicleSortOrder = "priceAsc" | "priceDesc" | "yearDesc";

interface VehicleFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  filter: VehicleTypeFilter;
  onFilterChange: (f: VehicleTypeFilter) => void;
  sort: VehicleSortOrder;
  onSortChange: (s: VehicleSortOrder) => void;
}

const FILTER_OPTIONS = [
  { id: "ALL" as const, label: "All", Icon: LayoutGrid },
  { id: "CAR" as const, label: "Cars", Icon: Car },
  { id: "MOTORBIKE" as const, label: "Motorbikes", Icon: Bike },
];

export function VehicleFilters({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
}: VehicleFiltersProps) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Search */}
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search brand or model..."
          className="pl-9"
        />
      </div>

      {/* Type filter pills */}
      <div className="flex items-center gap-1 rounded-md bg-zinc-100 p-0.5">
        {FILTER_OPTIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onFilterChange(id)}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
              filter === id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <Select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as VehicleSortOrder)}
        className="w-auto min-w-[180px]"
      >
        <option value="priceAsc">Price: low → high</option>
        <option value="priceDesc">Price: high → low</option>
        <option value="yearDesc">Year: newest first</option>
      </Select>
    </div>
  );
}
