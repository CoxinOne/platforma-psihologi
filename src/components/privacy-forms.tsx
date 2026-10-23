"use client";

import { useActionState } from "react";
import { Download, ShieldAlert, Trash2 } from "lucide-react";
import { requestAccountDeletionAction, requestDataExportAction } from "@/lib/actions/account";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, inputClasses } from "@/components/ui";

export function ExportDataForm() {
  const [state, formAction] = useActionState(requestDataExportAction, null);

  return (
    <form action={formAction} className="space-y-3">
      {state?.ok ? (
        <Alert tone="success">
          Cererea de export a fost înregistrată. Poți descărca imediat o copie a datelor tale.
        </Alert>
      ) : null}
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}
      <SubmitButton variant="secondary" pendingLabel="Se înregistrează…">
        <Download className="h-4 w-4" aria-hidden="true" />
        Solicită exportul datelor
      </SubmitButton>
      <p className="text-xs text-muted">
        Exportul include datele contului, profilul profesional (dacă există), programările,
        mesajele, notificările și raportările tale.
      </p>
    </form>
  );
}

export function DeleteAccountForm({ hasPendingRequest }: { hasPendingRequest: boolean }) {
  const [state, formAction] = useActionState(requestAccountDeletionAction, null);

  if (hasPendingRequest) {
    return (
      <Alert tone="warning" title="Există deja o solicitare de ștergere">
        Administratorul procesează cererea. Până atunci, contul rămâne disponibil, dar poți
        contacta platforma pentru a retrage solicitarea.
      </Alert>
    );
  }

  if (state?.ok) {
    return (
      <Alert tone="success" title="Solicitarea a fost înregistrată">
        Un administrator va verifica cererea și va șterge contul împreună cu datele asociate, în
        limitele legale. Vei primi o notificare înainte de procesare dacă este necesar.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}
      <div className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
        <p className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Ștergerea este ireversibilă
        </p>
        <p className="mt-1">
          Programările viitoare trebuie anulate înainte. Mesajele și istoricul vor fi eliminate.
          Unele date pot fi păstrate dacă există o obligație legală.
        </p>
      </div>
      <Field label="Motivul solicitării" htmlFor="delete-reason" hint="Opțional, ne ajută să înțelegem decizia.">
        <textarea id="delete-reason" name="reason" rows={2} maxLength={1000} className={inputClasses()} />
      </Field>
      <Field
        label="Confirmare"
        htmlFor="delete-confirmation"
        required
        hint="Scrie cuvântul „sterge” pentru a confirma."
      >
        <input
          id="delete-confirmation"
          name="confirmation"
          type="text"
          required
          autoComplete="off"
          className={inputClasses()}
          placeholder="sterge"
        />
      </Field>
      <SubmitButton variant="danger" pendingLabel="Se înregistrează…">
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Solicită ștergerea contului
      </SubmitButton>
    </form>
  );
}
