"use client";

import { useActionState } from "react";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import {
  addAvailabilityExceptionAction,
  addAvailabilityRuleAction,
  deleteAvailabilityExceptionFormAction,
  deleteAvailabilityRuleFormAction,
} from "@/lib/actions/psychologist";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Badge, Field, inputClasses } from "@/components/ui";
import { WEEKDAYS, MODE_LABELS } from "@/lib/constants";
import type { AvailabilityException, AvailabilityRule, CabinetSummary } from "@/lib/types";
import { firstError } from "@/lib/validation";

export function AvailabilityRulesSection({
  rules,
  cabinets,
}: {
  rules: AvailabilityRule[];
  cabinets: CabinetSummary[];
}) {
  const [state, formAction] = useActionState(addAvailabilityRuleAction, null);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-ink">Program săptămânal</h2>
        <p className="mt-1 text-sm text-muted">
          Orele sunt locale, în fusul orar al profilului. Pasul stabilește din câte în câte minute
          pot începe ședințele.
        </p>
      </div>

      {rules.length > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {rules.map((rule) => (
            <li key={rule.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">
                    {WEEKDAYS.find((day) => day.value === rule.weekday)?.label ?? rule.weekday}
                  </p>
                  <Badge tone="brand">{MODE_LABELS[rule.mode]}</Badge>
                  {!rule.is_active ? <Badge tone="neutral">Inactiv</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {rule.start_time.slice(0, 5)}–{rule.end_time.slice(0, 5)} · pas {rule.slot_step_minutes} min
                  {rule.cabinet_id
                    ? ` · ${cabinets.find((cabinet) => cabinet.id === rule.cabinet_id)?.name ?? "cabinet"}`
                    : ""}
                </p>
                {rule.valid_from || rule.valid_to ? (
                  <p className="text-xs text-muted">
                    Valabil {rule.valid_from ?? "..."} – {rule.valid_to ?? "..."}
                  </p>
                ) : null}
              </div>
              <form action={deleteAvailabilityRuleFormAction}>
                <input type="hidden" name="id" value={rule.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-danger hover:border-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Șterge
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <Alert tone="info">
          Nu ai intervale configurate. Fără ele, clienții nu văd ore disponibile.
        </Alert>
      )}

      <form action={formAction} className="rounded-2xl border border-line bg-canvas p-4">
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          <Plus className="h-4 w-4 text-brand" aria-hidden="true" />
          Adaugă un interval
        </h3>
        {state && !state.ok ? <Alert tone="danger" className="mt-3">{state.message}</Alert> : null}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Ziua" htmlFor="rule-weekday" required error={firstError(errors, "weekday")}>
            <select id="rule-weekday" name="weekday" required className={inputClasses()}>
              {WEEKDAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="De la" htmlFor="rule-start" required error={firstError(errors, "startTime")}>
            <input id="rule-start" name="startTime" type="time" required defaultValue="09:00" className={inputClasses()} />
          </Field>
          <Field label="Până la" htmlFor="rule-end" required error={firstError(errors, "endTime")}>
            <input id="rule-end" name="endTime" type="time" required defaultValue="17:00" className={inputClasses()} />
          </Field>
          <Field label="Pas (minute)" htmlFor="rule-step" required error={firstError(errors, "stepMinutes")}>
            <select id="rule-step" name="stepMinutes" defaultValue="30" className={inputClasses()}>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </select>
          </Field>
          <Field label="Tip" htmlFor="rule-mode" required error={firstError(errors, "mode")}>
            <select id="rule-mode" name="mode" defaultValue="online" className={inputClasses()}>
              <option value="online">Online</option>
              <option value="in_person">În cabinet</option>
            </select>
          </Field>
          <Field
            label="Cabinet"
            htmlFor="rule-cabinet"
            hint="Obligatoriu pentru ședințe în persoană."
            error={firstError(errors, "cabinetId")}
          >
            <select id="rule-cabinet" name="cabinetId" className={inputClasses()}>
              <option value="">Fără cabinet</option>
              {cabinets.map((cabinet) => (
                <option key={cabinet.id} value={cabinet.id}>
                  {cabinet.name} — {cabinet.city}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-3">
          <SubmitButton size="sm" pendingLabel="Se adaugă…">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Adaugă intervalul
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

export function AvailabilityExceptionsSection({
  exceptions,
}: {
  exceptions: AvailabilityException[];
}) {
  const [state, formAction] = useActionState(addAvailabilityExceptionAction, null);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
          <CalendarOff className="h-5 w-5 text-brand" aria-hidden="true" />
          Zile libere și program special
        </h2>
        <p className="mt-1 text-sm text-muted">
          O excepție înlocuiește programul săptămânal pentru data respectivă.
        </p>
      </div>

      {exceptions.length > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {exceptions.map((exception) => (
            <li key={exception.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-ink">{exception.exception_date}</p>
                <p className="text-sm text-muted">
                  {exception.is_closed
                    ? "Zi liberă"
                    : `${exception.start_time?.slice(0, 5)}–${exception.end_time?.slice(0, 5)}`}
                  {exception.note ? ` · ${exception.note}` : ""}
                </p>
              </div>
              <form action={deleteAvailabilityExceptionFormAction}>
                <input type="hidden" name="id" value={exception.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-danger hover:border-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Șterge
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Nu ai excepții viitoare.</p>
      )}

      <form action={formAction} className="rounded-2xl border border-line bg-canvas p-4">
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          <Plus className="h-4 w-4 text-brand" aria-hidden="true" />
          Adaugă o excepție
        </h3>
        {state && !state.ok ? <Alert tone="danger" className="mt-3">{state.message}</Alert> : null}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Data" htmlFor="exception-date" required error={firstError(errors, "date")}>
            <input id="exception-date" name="date" type="date" required className={inputClasses()} />
          </Field>
          <Field label="De la" htmlFor="exception-start" error={firstError(errors, "startTime")}>
            <input id="exception-start" name="startTime" type="time" className={inputClasses()} />
          </Field>
          <Field label="Până la" htmlFor="exception-end" error={firstError(errors, "endTime")}>
            <input id="exception-end" name="endTime" type="time" className={inputClasses()} />
          </Field>
          <Field label="Notă" htmlFor="exception-note" error={firstError(errors, "note")}>
            <input id="exception-note" name="note" maxLength={500} className={inputClasses()} />
          </Field>
        </div>
        <label className="mt-3 flex items-start gap-2 text-sm">
          <input type="checkbox" name="isClosed" value="on" defaultChecked className="mt-1 accent-[#1f4f49]" />
          <span>
            <span className="block font-semibold text-ink">Zi liberă</span>
            <span className="text-muted">Debifează pentru a defini un program special.</span>
          </span>
        </label>
        <div className="mt-3">
          <SubmitButton size="sm" variant="secondary" pendingLabel="Se salvează…">
            Salvează excepția
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
