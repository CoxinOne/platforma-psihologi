"use client";

import { useActionState } from "react";
import { Check, Save, X } from "lucide-react";
import {
  cancelAppointmentAction,
  completeAppointmentAction,
  confirmAppointmentAction,
  rejectAppointmentAction,
  saveAppointmentNoteAction,
} from "@/lib/actions/booking";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, inputClasses } from "@/components/ui";

export function ConfirmAppointmentForm({ appointmentId }: { appointmentId: string }) {
  const [state, formAction] = useActionState(confirmAppointmentAction, null);
  return (
    <form action={formAction} className="inline-flex flex-col gap-1">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      {state && !state.ok ? <span className="text-xs text-danger">{state.message}</span> : null}
      <SubmitButton size="sm" pendingLabel="Se confirmă…">
        <Check className="h-4 w-4" aria-hidden="true" />
        Confirmă
      </SubmitButton>
    </form>
  );
}

export function RejectAppointmentForm({ appointmentId }: { appointmentId: string }) {
  const [state, formAction] = useActionState(rejectAppointmentAction, null);
  return (
    <details className="rounded-xl border border-line bg-surface p-3">
      <summary className="cursor-pointer list-none text-sm font-semibold text-danger">
        <span className="inline-flex items-center gap-1.5">
          <X className="h-4 w-4" aria-hidden="true" />
          Respinge
        </span>
      </summary>
      <form action={formAction} className="mt-3 space-y-2">
        <input type="hidden" name="appointmentId" value={appointmentId} />
        {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}
        <Field label="Motiv" htmlFor={`reject-${appointmentId}`} required>
          <textarea
            id={`reject-${appointmentId}`}
            name="reason"
            rows={2}
            maxLength={500}
            required
            minLength={3}
            className={inputClasses()}
          />
        </Field>
        <SubmitButton size="sm" variant="danger" pendingLabel="Se respinge…">
          Trimite motivul
        </SubmitButton>
      </form>
    </details>
  );
}

export function CompleteAppointmentForm({ appointmentId }: { appointmentId: string }) {
  const [state, formAction] = useActionState(completeAppointmentAction, null);
  return (
    <form action={formAction} className="inline-flex flex-col gap-1">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      {state && !state.ok ? <span className="text-xs text-danger">{state.message}</span> : null}
      <SubmitButton size="sm" variant="secondary" pendingLabel="Se marchează…">
        Marchează finalizată
      </SubmitButton>
    </form>
  );
}

export function PsychologistCancelForm({ appointmentId }: { appointmentId: string }) {
  const [state, formAction] = useActionState(cancelAppointmentAction, null);
  return (
    <details className="rounded-xl border border-line bg-surface p-3">
      <summary className="cursor-pointer list-none text-sm font-semibold text-danger">
        Anulează ședința
      </summary>
      <form action={formAction} className="mt-3 space-y-2">
        <input type="hidden" name="appointmentId" value={appointmentId} />
        <input type="hidden" name="redirectTo" value="/cabinet/programari" />
        {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}
        <Field label="Motivul anulării" htmlFor={`cancel-${appointmentId}`} required>
          <textarea
            id={`cancel-${appointmentId}`}
            name="reason"
            rows={2}
            maxLength={500}
            required
            minLength={3}
            className={inputClasses()}
          />
        </Field>
        <SubmitButton size="sm" variant="danger" pendingLabel="Se anulează…">
          Confirmă anularea
        </SubmitButton>
      </form>
    </details>
  );
}

export function AppointmentNoteForm({
  appointmentId,
  note,
}: {
  appointmentId: string;
  note: string | null;
}) {
  const [state, formAction] = useActionState(saveAppointmentNoteAction, null);
  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      {state?.ok ? <Alert tone="success">Nota a fost salvată.</Alert> : null}
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}
      <Field
        label="Notă privată"
        htmlFor={`note-${appointmentId}`}
        hint="Vizibilă doar pentru tine. Nu include date clinice dacă nu ai un temei și o politică aprobată."
      >
        <textarea
          id={`note-${appointmentId}`}
          name="note"
          rows={2}
          maxLength={4000}
          defaultValue={note ?? ""}
          className={inputClasses()}
        />
      </Field>
      <SubmitButton size="sm" variant="secondary" pendingLabel="Se salvează…">
        <Save className="h-4 w-4" aria-hidden="true" />
        Salvează nota
      </SubmitButton>
    </form>
  );
}
