import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `€${amount.toLocaleString()}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} → ${formatDate(end)}`;
}

export function daysBetween(start: string, end: string): number {
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 86400000;
  return Math.max(1, Math.round(diff));
}

/** Weekend pricing: weekday × price + weekend × price × 1.5 */
export function calculatePrice(
  start: string,
  end: string,
  pricePerDay: number
): number {
  let weekday = 0;
  let weekend = 0;
  const d = new Date(start);
  const endDate = new Date(end);
  while (d < endDate) {
    const dow = d.getDay(); // 0=Sun, 6=Sat
    if (dow === 0 || dow === 6) weekend++;
    else weekday++;
    d.setDate(d.getDate() + 1);
  }
  return weekday * pricePerDay + weekend * pricePerDay * 1.5;
}
