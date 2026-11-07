import type {
  AppointmentStatus,
  ConsultationMode,
  ProfessionalStatus,
  ReportStatus,
  UserRole,
} from "./types";

export const PLATFORM_NAME = process.env.NEXT_PUBLIC_PLATFORM_NAME ?? "Platformă Psihologi";

export const CONSULTATION_MODES: { value: ConsultationMode; label: string; description: string }[] = [
  {
    value: "online",
    label: "Online",
    description: "Ședință prin videoconferință, cu link transmis după confirmare.",
  },
  {
    value: "in_person",
    label: "În cabinet",
    description: "Ședință la una dintre locațiile afișate pe profil.",
  },
];

export const MODE_LABELS: Record<ConsultationMode, string> = {
  online: "Online",
  in_person: "În cabinet",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "În așteptare",
  confirmed: "Confirmată",
  rejected: "Respinsă",
  cancelled: "Anulată",
  completed: "Finalizată",
  no_show: "Neprezentare",
};

export const APPOINTMENT_STATUS_TONE: Record<
  AppointmentStatus,
  "neutral" | "warning" | "success" | "danger"
> = {
  pending: "warning",
  confirmed: "success",
  rejected: "danger",
  cancelled: "neutral",
  completed: "success",
  no_show: "danger",
};

export const PROFESSIONAL_STATUS_LABELS: Record<ProfessionalStatus, string> = {
  draft: "Ciornă",
  pending: "În verificare",
  approved: "Aprobat",
  rejected: "Respins",
  suspended: "Suspendat",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  client: "Client",
  psychologist: "Psiholog",
  admin: "Administrator",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  open: "Deschisă",
  in_review: "În analiză",
  resolved: "Rezolvată",
  dismissed: "Respinsă",
};

export const WEEKDAYS = [
  { value: 1, label: "Luni", short: "Lu" },
  { value: 2, label: "Marți", short: "Ma" },
  { value: 3, label: "Miercuri", short: "Mi" },
  { value: 4, label: "Joi", short: "Jo" },
  { value: 5, label: "Vineri", short: "Vi" },
  { value: 6, label: "Sâmbătă", short: "Sâ" },
  { value: 0, label: "Duminică", short: "Du" },
] as const;

export const LANGUAGE_OPTIONS = [
  "română",
  "engleză",
  "maghiară",
  "franceză",
  "germană",
  "italiană",
  "spaniolă",
  "ucraineană",
] as const;

export const ABUSE_CATEGORIES = [
  { value: "spam", label: "Spam sau mesaje comerciale" },
  { value: "harassment", label: "Hărțuire sau amenințări" },
  { value: "inappropriate", label: "Conținut inadecvat" },
  { value: "impersonation", label: "Uzurpare de identitate" },
  { value: "other", label: "Altă situație" },
] as const;

export const MAX_MESSAGE_LENGTH = 4000;
export const DEFAULT_PAGE_SIZE = 12;

/** Tipuri istorice de notificări pentru modulul de programări, eliminat din UI. */
export const LEGACY_APPOINTMENT_NOTIFICATION_TYPES = [
  "appointment_requested",
  "appointment_confirmed",
  "appointment_rejected",
  "appointment_cancelled",
  "appointment_rescheduled",
  "appointment_completed",
] as const;
