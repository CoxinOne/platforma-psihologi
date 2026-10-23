"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MessageCircle, Send } from "lucide-react";
import { startConversationAction } from "@/lib/actions/messaging";
import { SubmitButton } from "@/components/submit-button";
import { Alert, buttonClasses, Field, inputClasses } from "@/components/ui";

export function ContactPsychologist({
  psychologistId,
  psychologistName,
  slug,
  isAuthenticated,
  isClient,
}: {
  psychologistId: string;
  psychologistName: string;
  slug: string;
  isAuthenticated: boolean;
  isClient: boolean;
}) {
  const [state, formAction] = useActionState(startConversationAction, null);

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-brand-line bg-brand-soft/50 p-5">
        <p className="flex items-center gap-2 font-semibold text-brand-strong">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Trimite un mesaj privat
        </p>
        <p className="mt-2 text-sm text-brand-strong/80">
          Conversațiile sunt private și pot fi citite doar de tine și de {psychologistName}.
          Autentifică-te pentru a începe discuția.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/autentificare?next=${encodeURIComponent(`/psihologi/${slug}`)}`}
            className={buttonClasses("primary", "sm")}
          >
            Autentificare
          </Link>
          <Link href="/inregistrare" className={buttonClasses("secondary", "sm")}>
            Creează cont
          </Link>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <Alert tone="info">
        Mesageria către psihologi este disponibilă conturilor de client. Contul tău are alt rol.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="psychologistId" value={psychologistId} />
      <Field
        label="Mesaj"
        htmlFor="conversation-message"
        hint="Mesajul este privat. Nu include date medicale sensibile în prima conversație."
      >
        <textarea
          id="conversation-message"
          name="body"
          rows={4}
          maxLength={4000}
          required
          className={inputClasses()}
          placeholder={`Bună ziua, aș dori să aflu mai multe despre o consultație cu ${psychologistName}.`}
        />
      </Field>

      {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Se deschide conversația…">
          <Send className="h-4 w-4" aria-hidden="true" />
          Trimite mesajul
        </SubmitButton>
        <p className="text-xs text-muted">
          Mesajele nu sunt trimise prin e-mail și nu sunt folosite pentru antrenarea unor servicii
          AI externe.
        </p>
      </div>
    </form>
  );
}
