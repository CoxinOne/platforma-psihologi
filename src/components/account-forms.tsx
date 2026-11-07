"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { updateNotificationPreferencesAction, updateProfileAction } from "@/lib/actions/profile";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, inputClasses } from "@/components/ui";
import { firstError } from "@/lib/validation";

export function ProfileForm({
  fullName,
  phone,
  marketingConsent,
  email,
}: {
  fullName: string;
  phone: string | null;
  marketingConsent: boolean;
  email: string;
}) {
  const [state, formAction] = useActionState(updateProfileAction, null);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state?.ok ? (
        <Alert tone="success">Datele au fost salvate.</Alert>
      ) : null}
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}

      <Field label="Adresa de e-mail" htmlFor="account-email" hint="Adresa de e-mail nu poate fi modificată aici; contactează administratorul.">
        <input id="account-email" type="email" value={email} readOnly disabled className={inputClasses()} />
      </Field>

      <Field label="Nume complet" htmlFor="profile-full-name" required error={firstError(errors, "fullName")}>
        <input
          id="profile-full-name"
          name="fullName"
          type="text"
          defaultValue={fullName}
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          className={inputClasses(Boolean(firstError(errors, "fullName")))}
        />
      </Field>

      <Field
        label="Telefon"
        htmlFor="profile-phone"
        hint="Opțional. Folosit doar dacă ai nevoie de contact telefonic pentru programare."
        error={firstError(errors, "phone")}
      >
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          defaultValue={phone ?? ""}
          maxLength={30}
          autoComplete="tel"
          className={inputClasses(Boolean(firstError(errors, "phone")))}
        />
      </Field>

      <div className="rounded-xl border border-line bg-canvas p-4">
        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            name="marketingConsent"
            defaultChecked={marketingConsent}
            className="mt-1 accent-brand"
          />
          <span>
            Vreau să primesc ocazional informații despre platformă și resurse utile. Consimțământul
            este opțional și poate fi retras oricând. Nu trimitem conținutul mesajelor sau date
            clinice prin e-mail.
          </span>
        </label>
      </div>

      <SubmitButton pendingLabel="Se salvează…">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Salvează modificările
      </SubmitButton>
    </form>
  );
}

export function NotificationPreferencesForm({
  inApp,
  emailMessages,
}: {
  inApp: boolean;
  emailMessages: boolean;
}) {
  const [state, formAction] = useActionState(updateNotificationPreferencesAction, null);
  return (
    <form action={formAction} className="space-y-4">
      {state?.ok ? <Alert tone="success">Preferințele au fost salvate.</Alert> : null}
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}

      <div className="space-y-3">
        <label className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3 text-sm">
          <input type="checkbox" name="inApp" defaultChecked={inApp} className="mt-1 accent-brand" />
          <span>
            <span className="block font-semibold text-ink">Notificări în aplicație</span>
            <span className="text-muted">Recomandat. Include mesaje noi și notificări de cont.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3 text-sm">
          <input
            type="checkbox"
            name="emailMessages"
            defaultChecked={emailMessages}
            className="mt-1 accent-brand"
          />
          <span>
            <span className="block font-semibold text-ink">E-mail pentru mesaje noi</span>
            <span className="text-muted">
              Doar o notificare generică, fără conținutul mesajului. Implicit dezactivat.
            </span>
          </span>
        </label>
      </div>

      <SubmitButton variant="secondary">Salvează preferințele</SubmitButton>
    </form>
  );
}
