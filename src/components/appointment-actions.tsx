"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { CalendarClock, XCircle } from "lucide-react";
import { cancelAppointmentAction, rescheduleAppointmentAction } from "@/lib/actions/booking";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, inputClasses, Spinner } from "@/components/ui";
import { todayInZone } from "@/lib/time";
import type { ConsultationMode } from "@/lib/types";
import { reportAbuseAction } from "@/lib/actions/messaging";
import { ABUSE_CATEGORIES } from "@/lib/constants";

const TIME_FORMAT = new Intl.DateTimeFormat("ro-RO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Bucharest",
});

export function CancelAppointmentForm({
  appointmentId,
  redirectTo,
  canCancel,
}: {
  appointmentId: string;
  redirectTo: string;
  canCancel: boolean;
}) {
  const [state, formAction] = useActionState(cancelAppointmentAction, null);

  if (!canCancel) {
    return (
      <Alert tone="warning" title="Anularea online nu mai este disponibilă">
        Au rămas mai puțin de 24 de ore până la ședință. Contactează direct psihologul pentru orice
        modificare.
      </Alert>
    );
  }

  return (
    <details className="rounded-2xl border border-line bg-surface p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-danger">
        <span className="inline-flex items-center gap-2">
          <XCircle className="h-4 w-4" aria-hidden="true" />
          Anulează programarea
        </span>
      </summary>
      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="appointmentId" value={appointmentId} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}
        <Field
          label="Motivul anulării"
          htmlFor="cancel-reason"
          hint="Opțional pentru client. Psihologul vede motivul."
        >
          <textarea id="cancel-reason" name="reason" rows={2} maxLength={500} className={inputClasses()} />
        </Field>
        <SubmitButton variant="danger" size="sm" pendingLabel="Se anulează…">
          Confirmă anularea
        </SubmitButton>
      </form>
    </details>
  );
}

export function RescheduleForm({
  appointmentId,
  psychologistId,
  mode,
  canReschedule,
}: {
  appointmentId: string;
  psychologistId: string;
  mode: ConsultationMode;
  canReschedule: boolean;
}) {
  const [date, setDate] = useState(todayInZone());
  const [slots, setSlots] = useState<{ startsAt: string; endsAt: string }[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [state, formAction] = useActionState(rescheduleAppointmentAction, null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setSelected("");

    const params = new URLSearchParams({
      psychologist: psychologistId,
      mode,
      from: date,
      days: "1",
    });

    fetch(`/api/slots?${params.toString()}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("failed");
        return response.json() as Promise<{ days: { slots: { startsAt: string; endsAt: string }[] }[] }>;
      })
      .then((payload) => {
        if (!cancelled) setSlots(payload.days[0]?.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, psychologistId, mode]);

  if (!canReschedule) {
    return (
      <Alert tone="warning" title="Reprogramarea online nu mai este disponibilă">
        Au rămas mai puțin de 24 de ore până la ședință. Contactează psihologul pentru o modificare.
      </Alert>
    );
  }

  return (
    <details className="rounded-2xl border border-line bg-surface p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-brand">
        <span className="inline-flex items-center gap-2">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Propune un alt interval
        </span>
      </summary>
      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="appointmentId" value={appointmentId} />
        <input type="hidden" name="startsAt" value={selected} />

        {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}

        <Field label="Ziua" htmlFor="reschedule-date" required>
          <input
            id="reschedule-date"
            type="date"
            value={date}
            min={todayInZone()}
            onChange={(event) => setDate(event.target.value)}
            className={inputClasses()}
          />
        </Field>

        {loading ? (
          <Spinner label="Se încarcă orele libere…" />
        ) : error ? (
          <p className="text-sm text-danger">Orele nu au putut fi încărcate.</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted">Nu există ore libere în această zi.</p>
        ) : (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ore disponibile">
            {slots.map((slot) => (
              <button
                key={slot.startsAt}
                type="button"
                onClick={() => setSelected(slot.startsAt)}
                aria-pressed={selected === slot.startsAt}
                className={
                  selected === slot.startsAt
                    ? "rounded-full bg-brand px-3.5 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-brand-line bg-surface px-3.5 py-2 text-sm font-medium text-brand hover:bg-brand-soft"
                }
              >
                {TIME_FORMAT.format(new Date(slot.startsAt))}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-muted">
          Solicitarea intră din nou în așteptare și trebuie confirmată de psiholog.
        </p>
        <SubmitButton variant="secondary" size="sm" pendingLabel="Se trimite…">
          Trimite noul interval
        </SubmitButton>
      </form>
    </details>
  );
}

export function ReportAbuseForm({
  options,
  defaultReportedUserId,
  defaultConversationId,
}: {
  options: { userId: string; conversationId: string | null; label: string }[];
  defaultReportedUserId?: string;
  defaultConversationId?: string;
}) {
  const [state, formAction] = useActionState(reportAbuseAction, null);
  const [selectedValue, setSelectedValue] = useState(() => {
    const initial = options.find((option) => option.userId === defaultReportedUserId);
    return initial ? `${initial.userId}|${initial.conversationId ?? ""}` : "";
  });

  const selectedOption = options.find(
    (option) => `${option.userId}|${option.conversationId ?? ""}` === selectedValue,
  );

  if (state?.ok) {
    return (
      <Alert tone="success" title="Raportarea a fost trimisă">
        Administratorul va verifica informațiile. Nu vei primi detalii despre acțiunile
        administrative, din motive de confidențialitate.
      </Alert>
    );
  }

  if (options.length === 0) {
    return (
      <Alert tone="info">
        Poți raporta doar un utilizator cu care ai deja o conversație sau o programare. Începe o
        conversație din profilul psihologului.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}
      <input type="hidden" name="reportedUserId" value={selectedOption?.userId ?? ""} />
      <input type="hidden" name="conversationId" value={selectedOption?.conversationId ?? ""} />

      <Field label="Despre cine este raportarea" htmlFor="report-target" required>
        <select
          id="report-target"
          required
          value={selectedValue}
          onChange={(event) => setSelectedValue(event.target.value)}
          className={inputClasses()}
        >
          <option value="">Selectează</option>
          {options.map((option) => (
            <option
              key={`${option.userId}-${option.conversationId ?? ""}`}
              value={`${option.userId}|${option.conversationId ?? ""}`}
            >
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Categorie" htmlFor="report-category" required>
        <select id="report-category" name="category" required className={inputClasses()}>
          {ABUSE_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Detalii"
        htmlFor="report-details"
        hint="Descrie faptele fără a include date medicale sau informații despre alte persoane."
      >
        <textarea
          id="report-details"
          name="details"
          rows={4}
          maxLength={2000}
          className={inputClasses()}
        />
      </Field>

      <SubmitButton variant="danger" pendingLabel="Se trimite raportarea…">
        Trimite raportarea
      </SubmitButton>
    </form>
  );
}
