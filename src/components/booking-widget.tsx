"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock, MapPin } from "lucide-react";
import { requestAppointmentAction } from "@/lib/actions/booking";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Badge, buttonClasses, Field, inputClasses, Spinner } from "@/components/ui";
import { MODE_LABELS } from "@/lib/constants";
import { todayInZone } from "@/lib/time";
import type { ConsultationMode } from "@/lib/types";
import type { SlotDay } from "@/lib/data/public";

const TIME_FORMAT = new Intl.DateTimeFormat("ro-RO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Bucharest",
});

const DAY_FORMAT = new Intl.DateTimeFormat("ro-RO", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function BookingWidget({
  psychologistId,
  psychologistName,
  slug,
  modes,
  duration,
  price,
  cabinets,
  isAuthenticated,
  isClient,
  loginNext,
}: {
  psychologistId: string;
  psychologistName: string;
  slug: string;
  modes: ConsultationMode[];
  duration: number;
  price: number | null;
  cabinets: { id: string; name: string; city: string; address_line: string }[];
  isAuthenticated: boolean;
  isClient: boolean;
  loginNext: string;
}) {
  const [mode, setMode] = useState<ConsultationMode>(modes[0] ?? "online");
  const [days, setDays] = useState<SlotDay[]>([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{ startsAt: string; endsAt: string } | null>(null);
  const [selectedCabinet, setSelectedCabinet] = useState(cabinets[0]?.id ?? "");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [state, formAction] = useActionState(requestAppointmentAction, null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    setSelectedSlot(null);

    const params = new URLSearchParams({
      psychologist: psychologistId,
      mode,
      from: todayInZone(),
      days: "21",
    });

    fetch(`/api/slots?${params.toString()}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("request failed");
        return response.json() as Promise<{ days: SlotDay[] }>;
      })
      .then((payload) => {
        if (cancelled) return;
        setDays(payload.days);
        setSelectedDay(payload.days[0]?.day ?? "");
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setDays([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [psychologistId, mode]);

  const dayData = days.find((day) => day.day === selectedDay);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {modes.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            aria-pressed={mode === option}
            className={
              mode === option
                ? "rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
                : "rounded-full border border-brand-line bg-surface px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-soft"
            }
          >
            {MODE_LABELS[option]}
          </button>
        ))}
        <Badge tone="neutral">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {duration} min
        </Badge>
        <Badge tone="sand">
          {price !== null ? `${price} RON` : "Tarif la solicitare"}
        </Badge>
      </div>

      <p className="text-sm text-muted">
        Programul este afișat în ora României. Solicitarea este trimisă psihologului, care o
        confirmă sau o respinge.
      </p>

      {loading ? (
        <div className="rounded-2xl border border-line bg-canvas p-6">
          <Spinner label="Se încarcă intervalele disponibile…" />
        </div>
      ) : loadError ? (
        <Alert tone="danger" title="Intervalele nu au putut fi încărcate">
          Verifică conexiunea și reîncarcă pagina.
        </Alert>
      ) : days.length === 0 ? (
        <Alert tone="info" title="Nu există intervale libere în perioada următoare">
          Psihologul nu are disponibilitate publicată sau toate intervalele sunt ocupate. Poți
          trimite un mesaj privat pentru a întreba despre alte opțiuni.
        </Alert>
      ) : (
        <>
          {mode === "in_person" && cabinets.length > 0 ? (
            <Field label="Cabinet" htmlFor="cabinet-select" required>
              <select
                id="cabinet-select"
                value={selectedCabinet}
                onChange={(event) => setSelectedCabinet(event.target.value)}
                className={inputClasses()}
              >
                {cabinets.map((cabinet) => (
                  <option key={cabinet.id} value={cabinet.id}>
                    {cabinet.name} — {cabinet.address_line}, {cabinet.city}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Alege ziua</p>
            <div className="flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Zile disponibile">
              {days.map((day) => (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day.day);
                    setSelectedSlot(null);
                  }}
                  aria-pressed={selectedDay === day.day}
                  className={
                    selectedDay === day.day
                      ? "shrink-0 rounded-xl bg-brand px-3 py-2 text-center text-sm font-semibold text-white"
                      : "shrink-0 rounded-xl border border-line bg-surface px-3 py-2 text-center text-sm font-medium text-ink hover:border-brand-line"
                  }
                >
                  <span className="block capitalize">{DAY_FORMAT.format(new Date(`${day.day}T12:00:00Z`))}</span>
                  <span className={selectedDay === day.day ? "text-xs text-white/70" : "text-xs text-muted"}>
                    {day.slots.length} {day.slots.length === 1 ? "oră" : "ore"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Alege ora</p>
            {dayData && dayData.slots.length > 0 ? (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Ore disponibile">
                {dayData.slots.map((slot) => (
                  <button
                    key={slot.startsAt}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    aria-pressed={selectedSlot?.startsAt === slot.startsAt}
                    className={
                      selectedSlot?.startsAt === slot.startsAt
                        ? "rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
                        : "rounded-full border border-brand-line bg-surface px-4 py-2 text-sm font-medium text-brand hover:bg-brand-soft"
                    }
                  >
                    {TIME_FORMAT.format(new Date(slot.startsAt))}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">Nu există ore libere în ziua selectată.</p>
            )}
          </div>
        </>
      )}

      {isAuthenticated ? (
        isClient ? (
          <form action={formAction} className="space-y-4 rounded-2xl border border-line bg-canvas p-4">
            <input type="hidden" name="psychologistId" value={psychologistId} />
            <input type="hidden" name="mode" value={mode} />
            <input type="hidden" name="startsAt" value={selectedSlot?.startsAt ?? ""} />
            <input type="hidden" name="cabinetId" value={mode === "in_person" ? selectedCabinet : ""} />

            <Field
              label="Mesaj pentru psiholog"
              htmlFor="appointment-note"
              hint="Opțional. Nu include informații medicale detaliate în primul mesaj."
            >
              <textarea
                id="appointment-note"
                name="note"
                rows={3}
                maxLength={1000}
                className={inputClasses()}
                placeholder="Ex. Aș dori o primă discuție despre gestionarea stresului."
              />
            </Field>

            {state && !state.ok ? <Alert tone="danger">{state.message}</Alert> : null}

            <div className="flex flex-wrap items-center gap-3">
              <SubmitButton pendingLabel="Se trimite solicitarea…">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Solicită programarea
              </SubmitButton>
              <p className="text-xs text-muted">
                Solicitarea nu este confirmată automat. Primești notificare după răspuns.
              </p>
            </div>

            {selectedSlot ? (
              <p className="flex items-center gap-2 text-sm text-brand-strong">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {DAY_FORMAT.format(new Date(`${selectedDay}T12:00:00Z`))}, ora{" "}
                {TIME_FORMAT.format(new Date(selectedSlot.startsAt))}
                {mode === "in_person" && selectedCabinet
                  ? ` — ${cabinets.find((cabinet) => cabinet.id === selectedCabinet)?.name ?? "cabinet"}`
                  : ""}
              </p>
            ) : (
              <p className="text-sm text-muted">Selectează o oră pentru a continua.</p>
            )}
          </form>
        ) : (
          <Alert tone="info" title="Programările sunt disponibile conturilor de client">
            Contul tău are alt rol. Folosește un cont de client pentru a solicita o ședință.
          </Alert>
        )
      ) : (
        <div className="rounded-2xl border border-brand-line bg-brand-soft/60 p-4">
          <p className="text-sm font-semibold text-brand-strong">
            Autentifică-te pentru a solicita o programare
          </p>
          <p className="mt-1 text-sm text-brand-strong/80">
            Contul este necesar pentru a păstra istoricul și pentru a primi confirmarea.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/autentificare?next=${encodeURIComponent(loginNext)}`}
              className={buttonClasses("primary", "sm")}
            >
              Autentificare
            </Link>
            <Link href="/inregistrare" className={buttonClasses("secondary", "sm")}>
              Creează cont
            </Link>
          </div>
        </div>
      )}

      {mode === "in_person" && cabinets.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-warning">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Psihologul nu are un cabinet publicat pentru consultații în persoană.
        </p>
      ) : null}

      <p className="text-xs text-muted">
        Psiholog: {psychologistName}. Anularea sau reprogramarea de către client este posibilă cu cel
        puțin 24 de ore înainte, conform regulilor platformei.
      </p>
    </div>
  );
}
