"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { submitContactFormAction } from "@/lib/actions/contact";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, inputClasses } from "@/components/ui";
import { firstError } from "@/lib/validation";

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactFormAction, null);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  if (state?.ok) {
    const data = state.data;
    return (
      <div className="space-y-4">
        <Alert tone="success" title="Mesajul a fost înregistrat">
          Mulțumim. Mesajul tău a ajuns în sistemul de contact al platformei.
        </Alert>
        {!data.emailConfigured ? (
          <Alert tone="warning" title="Notificarea pe e-mail nu este configurată">
            Mesajul este salvat, dar serverul nu are configurat un furnizor de e-mail. Un
            administrator îl va citi în panoul intern.
          </Alert>
        ) : !data.emailSent ? (
          <Alert tone="warning" title="E-mailul nu a putut fi trimis">
            Mesajul este salvat în platformă, dar notificarea pe e-mail a eșuat. Un administrator îl
            va citi în panoul intern.
          </Alert>
        ) : null}
        <p className="text-sm text-muted">
          Pentru o solicitare urgentă privind siguranța, apelează 112. Nu trimite date medicale
          sensibile prin acest formular.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nume" htmlFor="contact-name" required error={firstError(errors, "name")}>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            className={inputClasses(Boolean(firstError(errors, "name")))}
          />
        </Field>
        <Field label="E-mail" htmlFor="contact-email" required error={firstError(errors, "email")}>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClasses(Boolean(firstError(errors, "email")))}
          />
        </Field>
      </div>

      <Field label="Subiect" htmlFor="contact-subject" required error={firstError(errors, "subject")}>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          maxLength={160}
          className={inputClasses(Boolean(firstError(errors, "subject")))}
        />
      </Field>

      <Field
        label="Mesaj"
        htmlFor="contact-message"
        required
        hint="Maximum 4000 de caractere. Nu include date medicale sau informații despre terți."
        error={firstError(errors, "message")}
      >
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          maxLength={4000}
          className={inputClasses(Boolean(firstError(errors, "message")))}
        />
      </Field>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Nu completa acest câmp</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Se trimite…">
          <Send className="h-4 w-4" aria-hidden="true" />
          Trimite mesajul
        </SubmitButton>
        <p className="text-xs text-muted">
          Datele sunt folosite exclusiv pentru a răspunde solicitării.
        </p>
      </div>
    </form>
  );
}
