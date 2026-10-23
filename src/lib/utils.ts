import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function pluralRo(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

export function formatPriceRon(value: number | null | undefined): string {
  if (value === null || value === undefined) return "La solicitare";
  return `${new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2 }).format(value)} RON`;
}
