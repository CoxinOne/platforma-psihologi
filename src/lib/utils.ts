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

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Construiește un link WhatsApp dintr-un număr public de telefon.
 * Acceptă formate precum „+40 712 345 678”, „0712345678” sau „0040712345678”.
 * Numerele locale care încep cu 0 sunt convertite în prefix internațional românesc.
 */
export function whatsappHref(
  phone: string | null | undefined,
  psychologistName?: string,
): string | null {
  if (!phone) return null;

  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `4${digits}`;

  if (digits.length < 8 || digits.length > 15) return null;

  const greeting = psychologistName
    ? `Bună ziua! Vă contactez prin intermediul Platformei Psihologi în legătură cu profilul ${psychologistName}.`
    : "Bună ziua! Vă contactez prin intermediul Platformei Psihologi.";
  return `https://wa.me/${digits}?text=${encodeURIComponent(greeting)}`;
}
