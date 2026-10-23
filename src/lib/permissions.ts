import type { UserRole } from "./types";

export type AppArea = "client" | "psychologist" | "admin";

export function roleHome(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "psychologist":
      return "/cabinet";
    default:
      return "/dashboard";
  }
}

export function areaForRole(role: UserRole): AppArea {
  switch (role) {
    case "admin":
      return "admin";
    case "psychologist":
      return "psychologist";
    default:
      return "client";
  }
}

export function canAccessArea(role: UserRole, area: AppArea): boolean {
  if (role === "admin") return true;
  if (role === "psychologist") return area === "psychologist" || area === "client";
  return area === "client";
}

/**
 * Acceptă doar căi interne. Blochează `//evil.com`, URL-uri absolute și
 * caractere de control care ar putea fi folosite pentru open redirect.
 */
export function isSafeRedirect(value: string | null | undefined): value is string {
  if (!value) return false;
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (value.includes("\\") || value.includes("\n") || value.includes("\r")) return false;
  return value.length <= 500;
}

export function safeNext(value: string | null | undefined, fallback: string): string {
  return isSafeRedirect(value) ? value : fallback;
}

export function canClientCancel(startsAt: string | Date, now: Date = new Date(), windowHours = 24): boolean {
  const start = new Date(startsAt).getTime();
  if (Number.isNaN(start)) return false;
  return start - now.getTime() >= windowHours * 60 * 60 * 1000;
}

export function canReschedule(startsAt: string | Date, now: Date = new Date(), windowHours = 24): boolean {
  return canClientCancel(startsAt, now, windowHours);
}
