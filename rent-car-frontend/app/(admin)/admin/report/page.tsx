"use client";

import { Download, DollarSign, Calendar, Car, Check } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/reservations/StatusBadge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { useVehicleReport } from "@/hooks/useAdminData";
import { formatPrice } from "@/lib/utils";
import type { VehicleReportResponse } from "@/types/api";

function buildReportHtml(data: VehicleReportResponse[]): string {
  const rows = data
    .map(
      (v) => `
    <tr>
      <td>${v.brand} ${v.model} (${v.year})</td>
      <td>${v.type}</td>
      <td>${v.pricePerDay}</td>
      <td>${v.reservationCount}</td>
      <td>${v.totalRevenue}</td>
      <td>${v.weekdayDays}</td>
      <td>${v.weekendDays}</td>
      <td>${v.available ? "Yes" : "No"}</td>
    </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>RentCar Report</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 32px; background: #fff; color: #18181b; }
    h1 { font-size: 22px; font-weight: 600; margin-bottom: 4px; }
    p { color: #71717a; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 10px 12px; border-bottom: 2px solid #e4e4e7; color: #71717a; font-weight: 500; }
    td { padding: 10px 12px; border-bottom: 1px solid #f4f4f5; }
    tr:hover td { background: #fafafa; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>RentCar — Vehicle Report</h1>
  <p>Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  <table>
    <thead>
      <tr>
        <th>Vehicle</th><th>Type</th><th>€/day</th><th>Reservations</th>
        <th>Revenue (€)</th><th>Weekday days</th><th>Weekend days</th><th>Available</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

function downloadHtml(data: VehicleReportResponse[]) {
  const html = buildReportHtml(data);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rentcar-report.html";
  a.click();
  URL.revokeObjectURL(url);
}

function KPI({ label, value, sub, Icon }: {
  label: string; value: string | number; sub: string;
  Icon: React.FC<{ className?: string }>;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </div>
        <div className="grid h-7 w-7 place-items-center rounded-md bg-zinc-50 text-zinc-500">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-zinc-500">{sub}</div>
    </Card>
  );
}

export default function AdminReportPage() {
  const { data: report, isLoading } = useVehicleReport();
  const data = report ?? [];

  const totalRevenue = data.reduce((s, v) => s + v.totalRevenue, 0);
  const totalReservations = data.reduce((s, v) => s + v.reservationCount, 0);
  const activeVehicles = data.filter((v) => v.available).length;
  const totalWeekday = data.reduce((s, v) => s + v.weekdayDays, 0);
  const totalWeekend = data.reduce((s, v) => s + v.weekendDays, 0);
  const topByRevenue = [...data].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
  const maxRevenue = topByRevenue[0]?.totalRevenue ?? 1;

  return (
    <div className="px-7 py-7">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Admin
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900">
            Report
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Operational stats and revenue overview.
          </p>
        </div>
        <Button
          variant="default"
          onClick={() => downloadHtml(data)}
          disabled={data.length === 0}
        >
          <Download className="h-4 w-4" /> Download HTML
        </Button>
      </div>

      {isLoading && (
        <div className="py-16 text-center text-sm text-zinc-500">Loading…</div>
      )}

      {!isLoading && (
        <>
          {/* KPI cards */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KPI label="Total revenue" value={formatPrice(totalRevenue)} sub="All non-cancelled reservations" Icon={DollarSign} />
            <KPI label="Total reservations" value={totalReservations} sub="Across all vehicles" Icon={Calendar} />
            <KPI label="Active vehicles" value={`${activeVehicles} / ${data.length}`} sub="Available now" Icon={Car} />
            <KPI label="Weekend ratio" value={`${totalWeekend + totalWeekday > 0 ? Math.round((totalWeekend / (totalWeekend + totalWeekday)) * 100) : 0}%`} sub={`${totalWeekend} weekend · ${totalWeekday} weekday days`} Icon={Check} />
          </div>

          {/* Top vehicles */}
          {topByRevenue.length > 0 && (
            <Card className="mb-5">
              <div className="border-b border-zinc-100 p-5">
                <CardTitle>Top performing vehicles</CardTitle>
                <CardDescription>Ranked by total revenue</CardDescription>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Reservations</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead>Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topByRevenue.map((v, i) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-zinc-400 tabular-nums">{i + 1}</TableCell>
                      <TableCell className="font-medium text-zinc-900">
                        {v.brand} {v.model}
                      </TableCell>
                      <TableCell>
                        <Badge variant={v.type === "CAR" ? "car" : "motorbike"}>
                          {v.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {v.reservationCount}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatPrice(v.totalRevenue)}
                      </TableCell>
                      <TableCell>
                        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className="h-full bg-accent"
                            style={{ width: `${(v.totalRevenue / maxRevenue) * 100}%` }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Full stats table */}
          <Card className="overflow-hidden">
            <div className="border-b border-zinc-100 p-5">
              <CardTitle>All vehicles — detailed stats</CardTitle>
              <CardDescription>Non-cancelled reservations only</CardDescription>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">€/day</TableHead>
                  <TableHead className="text-right">Reservations</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Weekday days</TableHead>
                  <TableHead className="text-right">Weekend days</TableHead>
                  <TableHead>Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="font-medium text-zinc-900">
                        {v.brand} {v.model}
                      </div>
                      <div className="text-[11px] text-zinc-400">{v.year}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.type === "CAR" ? "car" : "motorbike"}>
                        {v.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">€{v.pricePerDay}</TableCell>
                    <TableCell className="text-right tabular-nums">{v.reservationCount}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatPrice(v.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{v.weekdayDays}</TableCell>
                    <TableCell className="text-right tabular-nums">{v.weekendDays}</TableCell>
                    <TableCell>
                      <Badge variant={v.available ? "available" : "unavailable"}>
                        <span className={`h-1.5 w-1.5 rounded-full ${v.available ? "bg-emerald-500" : "bg-zinc-400"}`} />
                        {v.available ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.length === 0 && (
              <div className="py-12 text-center text-sm text-zinc-500">
                No report data available.
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
