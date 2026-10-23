/**
 * Utilitare de timp. Toate datele sunt stocate în PostgreSQL ca timestamptz (UTC),
 * iar afișarea se face în fusul orar al platformei (implicit Europe/Bucharest).
 */
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { ro } from "date-fns/locale";

export const PLATFORM_TIMEZONE = "Europe/Bucharest";

export function formatDateTime(
  value: string | Date,
  timeZone: string = PLATFORM_TIMEZONE,
): string {
  return formatInTimeZone(new Date(value), timeZone, "d MMMM yyyy, HH:mm", { locale: ro });
}

export function formatDate(
  value: string | Date,
  timeZone: string = PLATFORM_TIMEZONE,
): string {
  return formatInTimeZone(new Date(value), timeZone, "d MMMM yyyy", { locale: ro });
}

export function formatDateShort(
  value: string | Date,
  timeZone: string = PLATFORM_TIMEZONE,
): string {
  return formatInTimeZone(new Date(value), timeZone, "d MMM", { locale: ro });
}

export function formatTime(
  value: string | Date,
  timeZone: string = PLATFORM_TIMEZONE,
): string {
  return formatInTimeZone(new Date(value), timeZone, "HH:mm", { locale: ro });
}

export function formatWeekday(
  value: string | Date,
  timeZone: string = PLATFORM_TIMEZONE,
): string {
  return formatInTimeZone(new Date(value), timeZone, "EEEE", { locale: ro });
}

export function localDateKey(
  value: string | Date,
  timeZone: string = PLATFORM_TIMEZONE,
): string {
  return formatInTimeZone(new Date(value), timeZone, "yyyy-MM-dd");
}

/**
 * Construiește un instant UTC dintr-o dată calendaristică și o oră locală.
 * Gestionează corect schimbarea orei: `fromZonedTime` aplică offsetul zonei
 * pentru data respectivă, nu offsetul curent.
 */
export function zonedDateTimeToUtc(
  date: string,
  time: string,
  timeZone: string = PLATFORM_TIMEZONE,
): Date {
  const normalized = time.length === 5 ? time : time.padStart(5, "0");
  return fromZonedTime(`${date}T${normalized}:00`, timeZone);
}

export function toZoned(value: string | Date, timeZone: string = PLATFORM_TIMEZONE): Date {
  return toZonedTime(new Date(value), timeZone);
}

/**
 * Generează începuturile posibile de ședință pentru o fereastră locală.
 * Este folosit pentru previzualizări și teste; sursa de adevăr rămâne funcția
 * SQL `available_slots`, care verifică și programările existente.
 */
export function generateLocalSlots(options: {
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  stepMinutes: number;
  timeZone?: string;
}): Date[] {
  const timeZone = options.timeZone ?? PLATFORM_TIMEZONE;
  const [startHour, startMinute] = options.startTime.split(":").map(Number);
  const [endHour, endMinute] = options.endTime.split(":").map(Number);

  if (
    startHour === undefined ||
    startMinute === undefined ||
    endHour === undefined ||
    endMinute === undefined
  ) {
    return [];
  }

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const lastStart = endMinutes - options.durationMinutes;
  const slots: Date[] = [];
  const seen = new Set<number>();

  for (let minute = startMinutes; minute <= lastStart; minute += options.stepMinutes) {
    const hh = String(Math.floor(minute / 60)).padStart(2, "0");
    const mm = String(minute % 60).padStart(2, "0");
    const instant = zonedDateTimeToUtc(options.date, `${hh}:${mm}`, timeZone);
    if (Number.isNaN(instant.getTime())) continue;
    // Pe ziua trecerii la ora de vară, două ore locale pot lipsi. Eliminăm
    // duplicatele exacte rezultate din normalizarea orelor inexistente.
    if (seen.has(instant.getTime())) continue;
    seen.add(instant.getTime());
    slots.push(instant);
  }

  return slots;
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  const value = new Date(Date.UTC(year, month - 1, day + days));
  return value.toISOString().slice(0, 10);
}

export function todayInZone(timeZone: string = PLATFORM_TIMEZONE): string {
  return localDateKey(new Date(), timeZone);
}

export function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function formatDuration(minutes: number): string {
  return `${minutes} de minute`;
}
