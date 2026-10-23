import { Badge } from "@/components/ui";
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_TONE, MODE_LABELS } from "@/lib/constants";
import type { AppointmentStatus, ConsultationMode } from "@/lib/types";

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge tone={APPOINTMENT_STATUS_TONE[status]}>{APPOINTMENT_STATUS_LABELS[status]}</Badge>;
}

export function ModeBadge({ mode }: { mode: ConsultationMode }) {
  return <Badge tone="brand">{MODE_LABELS[mode]}</Badge>;
}
