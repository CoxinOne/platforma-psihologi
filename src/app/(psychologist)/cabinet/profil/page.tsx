import Link from "next/link";
import { BadgeCheck, Info } from "lucide-react";
import { requirePsychologist } from "@/lib/auth";
import {
  getMyPsychologistProfile,
  listAllSpecialties,
  listMyCabinets,
  listMySpecialties,
  listSelectableCabinets,
} from "@/lib/data/user";
import { PROFESSIONAL_STATUS_LABELS } from "@/lib/constants";
import { PsychologistProfileForm } from "@/components/psychologist-profile-form";
import { Alert, buttonClasses, Card, DemoBadge, PageHeader } from "@/components/ui";

export default async function PsychologistProfilePage() {
  const session = await requirePsychologist();
  const profile = await getMyPsychologistProfile(session.supabase, session.user.id);

  const [specialties, selectedSpecialties, cabinets, selectedCabinets] = await Promise.all([
    listAllSpecialties(session.supabase),
    profile ? listMySpecialties(session.supabase, session.user.id) : Promise.resolve([]),
    listSelectableCabinets(session.supabase),
    profile ? listMyCabinets(session.supabase, session.user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profil profesional"
        title={profile ? "Editează profilul" : "Creează profilul profesional"}
        description="Datele completate aici apar public numai după aprobarea administratorului."
        action={
          profile?.status === "approved" ? (
            <Link href={`/psihologi/${profile.slug}`} className={buttonClasses("secondary")}>
              Vezi profilul public
            </Link>
          ) : null
        }
      />

      {profile ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-brand-line bg-brand-soft/40 p-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-brand-strong">
              Status: {PROFESSIONAL_STATUS_LABELS[profile.status]}
            </p>
            {profile.status === "approved" ? <BadgeCheck className="h-4 w-4 text-success" /> : null}
            {profile.is_demo ? <DemoBadge /> : null}
          </div>
          <p className="text-xs text-brand-strong/80">
            {profile.status === "pending"
              ? "Profilul este în verificare. Modificările rămân salvate, dar publicarea depinde de aprobare."
              : profile.status === "approved"
                ? "Profilul este public. Modificările se aplică imediat; datele de verificare rămân înregistrate."
                : "Completează câmpurile obligatorii și trimite profilul spre verificare."}
          </p>
        </Card>
      ) : (
        <Alert tone="info" title="Începe cu datele de bază">
          Ai nevoie de nume profesional, titlu, prezentare, studii, cel puțin o specializare și un
          tip de consultație. Pentru ședințele în persoană este necesar un cabinet.
        </Alert>
      )}

      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-7">
        <PsychologistProfileForm
          userId={session.user.id}
          profile={profile}
          specialties={specialties}
          selectedSpecialtyIds={selectedSpecialties.map((specialty) => specialty.id)}
          cabinets={cabinets}
          selectedCabinetIds={selectedCabinets.map((cabinet) => cabinet.id)}
        />
      </div>

      <Card className="p-5 text-sm text-muted">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <Info className="h-4 w-4 text-brand" aria-hidden="true" />
          Despre verificare
        </p>
        <p className="mt-2">
          Administratorul poate solicita documente suplimentare pentru studii și calificări. Nu
          publicăm numărul de înregistrare profesională. Profilurile respinse pot fi corectate și
          retrimise.
        </p>
      </Card>
    </div>
  );
}
