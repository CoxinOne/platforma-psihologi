import type { Metadata } from "next";
import { MapPin, Phone } from "lucide-react";
import { listCabinets } from "@/lib/data/public";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Cabinete",
  description: "Locațiile de consultație publicate pe platformă, cu adrese și date de contact.",
};

export default async function CabinetsPage() {
  const cabinets = await listCabinets();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Locații"
        title="Cabinete"
        description="Adresele afișate aparțin psihologilor cu profiluri aprobate. Verifică întotdeauna adresa și programarea înainte de deplasare."
      />

      <div className="mt-8">
        {cabinets.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cabinets.map((cabinet) => (
              <li key={cabinet.id}>
                <Card className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-ink">{cabinet.name}</h2>
                    {cabinet.is_demo ? <Badge tone="sand">Demonstrativ</Badge> : null}
                  </div>
                  <p className="mt-2 flex items-start gap-2 text-sm text-muted">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                    <span>
                      {cabinet.address_line}
                      <br />
                      {cabinet.city}
                      {cabinet.county ? `, ${cabinet.county}` : ""}
                      {cabinet.postal_code ? `, ${cabinet.postal_code}` : ""}
                    </span>
                  </p>
                  {cabinet.phone ? (
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                      <Phone className="h-4 w-4 text-brand" aria-hidden="true" />
                      <a href={`tel:${cabinet.phone.replace(/\s/g, "")}`} className="hover:text-brand">
                        {cabinet.phone}
                      </a>
                    </p>
                  ) : null}
                  {cabinet.description ? (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{cabinet.description}</p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="text-xs text-muted">
                      {cabinet.psychologist_count} {cabinet.psychologist_count === 1 ? "psiholog" : "psihologi"}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${cabinet.address_line}, ${cabinet.city}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm font-semibold text-brand underline underline-offset-4"
                    >
                      Hartă
                    </a>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Nu există cabinete publicate"
            description="Cabinetele apar aici după ce administratorul le adaugă și le asociază profilurilor aprobate."
          />
        )}
      </div>
    </div>
  );
}
