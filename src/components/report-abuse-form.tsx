"use client";

import { useState } from "react";
import { useActionState } from "react";
import { reportAbuseAction } from "@/lib/actions/messaging";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, inputClasses } from "@/components/ui";
import { ABUSE_CATEGORIES } from "@/lib/constants";

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
        Poți raporta doar un utilizator cu care ai deja o conversație. Începe o conversație din
        profilul psihologului.
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
