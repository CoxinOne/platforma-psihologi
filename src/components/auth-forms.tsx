"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alert, Field, inputClasses } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import {
  forgotPasswordAction,
  resendConfirmationAction,
  resetPasswordAction,
  signInAction,
  signUpAction,
} from "@/lib/actions/auth";
import { firstError } from "@/lib/validation";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signInAction, null);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}
      <Field label="Adresa de e-mail" htmlFor="email" required error={firstError(errors, "email")}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClasses(Boolean(firstError(errors, "email")))}
        />
      </Field>
      <Field label="Parolă" htmlFor="password" required error={firstError(errors, "password")}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClasses(Boolean(firstError(errors, "password")))}
        />
      </Field>
      <div className="flex items-center justify-between gap-3 text-sm">
        <Link href="/parola-uitata" className="font-medium text-brand underline underline-offset-4">
          Am uitat parola
        </Link>
        <Link href="/inregistrare" className="text-muted hover:text-brand">
          Nu am cont
        </Link>
      </div>
      <SubmitButton className="w-full" pendingLabel="Se autentifică…">
        Autentificare
      </SubmitButton>
    </form>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(signUpAction, null);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}

      <div className="rounded-xl border border-brand-line bg-brand-soft/60 p-3 text-xs text-muted">
        <span className="font-semibold text-ink">Cont public de client.</span> Conturile de
        psiholog sunt create exclusiv de administrator, în limita a 12 conturi.
      </div>

      <Field label="Nume complet" htmlFor="fullName" required error={firstError(errors, "fullName")}>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={120}
          className={inputClasses(Boolean(firstError(errors, "fullName")))}
        />
      </Field>

      <Field label="Adresa de e-mail" htmlFor="signup-email" required error={firstError(errors, "email")}>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClasses(Boolean(firstError(errors, "email")))}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Parolă"
          htmlFor="signup-password"
          required
          hint="Minimum 10 caractere, o literă și o cifră."
          error={firstError(errors, "password")}
        >
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            className={inputClasses(Boolean(firstError(errors, "password")))}
          />
        </Field>
        <Field
          label="Confirmă parola"
          htmlFor="confirmPassword"
          required
          error={firstError(errors, "confirmPassword")}
        >
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className={inputClasses(Boolean(firstError(errors, "confirmPassword")))}
          />
        </Field>
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" name="terms" required className="mt-1 accent-brand" />
          <span>
            Accept{" "}
            <Link href="/termeni" className="font-medium text-brand underline underline-offset-4">
              termenii de utilizare
            </Link>{" "}
            și{" "}
            <Link href="/confidentialitate" className="font-medium text-brand underline underline-offset-4">
              politica de confidențialitate
            </Link>
            .
          </span>
        </label>
        {firstError(errors, "terms") ? (
          <p className="text-sm font-medium text-danger">{firstError(errors, "terms")}</p>
        ) : null}
        <label className="flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" name="ageConfirm" required className="mt-1 accent-brand" />
          <span>Confirm că am cel puțin 16 ani.</span>
        </label>
        {firstError(errors, "ageConfirm") ? (
          <p className="text-sm font-medium text-danger">{firstError(errors, "ageConfirm")}</p>
        ) : null}
      </div>

      <SubmitButton className="w-full" pendingLabel="Se creează contul…">
        Creează contul
      </SubmitButton>
      <p className="text-xs text-muted">
        Primești un e-mail de confirmare. Contul nu este activ până nu confirmi adresa.
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, null);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  if (state?.ok) {
    return (
      <Alert tone="success" title="Verifică e-mailul">
        Dacă există un cont pentru adresa introdusă, vei primi un link de resetare în câteva
        minute. Verifică și folderul de spam.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}
      <Field label="Adresa de e-mail" htmlFor="forgot-email" required error={firstError(errors, "email")}>
        <input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClasses(Boolean(firstError(errors, "email")))}
        />
      </Field>
      <SubmitButton className="w-full" pendingLabel="Se trimite linkul…">
        Trimite linkul de resetare
      </SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {  const [state, formAction] = useActionState(resetPasswordAction, null);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}
      <Field
        label="Parolă nouă"
        htmlFor="new-password"
        required
        hint="Minimum 10 caractere, o literă și o cifră."
        error={firstError(errors, "password")}
      >
        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          className={inputClasses(Boolean(firstError(errors, "password")))}
        />
      </Field>
      <Field
        label="Confirmă parola nouă"
        htmlFor="confirm-new-password"
        required
        error={firstError(errors, "confirmPassword")}
      >
        <input
          id="confirm-new-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className={inputClasses(Boolean(firstError(errors, "confirmPassword")))}
        />
      </Field>
      <SubmitButton className="w-full" pendingLabel="Se salvează parola…">
        Salvează parola
      </SubmitButton>
    </form>
  );
}

export function ResendConfirmationForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [state, formAction] = useActionState(resendConfirmationAction, null);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  if (state?.ok) {
    return (
      <Alert tone="success">
        Dacă adresa există și nu este confirmată, vei primi un nou e-mail de confirmare.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}
      <Field label="Adresa de e-mail" htmlFor="resend-email" required error={firstError(errors, "email")}>
        <input
          id="resend-email"
          name="email"
          type="email"
          defaultValue={initialEmail}
          required
          className={inputClasses(Boolean(firstError(errors, "email")))}
        />
      </Field>
      <SubmitButton variant="secondary" pendingLabel="Se trimite…">
        Retrimite e-mailul de confirmare
      </SubmitButton>
    </form>
  );
}
