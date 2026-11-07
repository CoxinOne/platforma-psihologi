import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  BookOpenCheck,
  Database,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { buttonClasses, Card, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Despre platformă",
  description:
    "Cum funcționează platforma, cum sunt verificate profilurile profesionale și ce limite are serviciul.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Despre"
        title="O platformă pentru prezentare și comunicare"
        description="Platformă Psihologi este o denumire de lucru. Identitatea finală, operatorul și documentele juridice se stabilesc înainte de lansarea publică."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card>
          <HeartHandshake className="h-6 w-6 text-brand" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold text-ink">Ce face platforma</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Ajută o persoană să găsească un psiholog, să citească un profil profesional complet și
            să trimită un mesaj privat. Detaliile consultației și tariful se discută direct, în
            funcție de complexitate, fără programări sau plăți pe platformă.
          </p>
        </Card>
        <Card>
          <BookOpenCheck className="h-6 w-6 text-brand" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold text-ink">Ce nu face platforma</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Nu pune diagnostice, nu realizează evaluări clinice, nu ține dosare medicale și nu
            înlocuiește un serviciu de urgență. Nu promite rezultate terapeutice și nu inventează
            recenzii sau calificări.
          </p>
        </Card>
        <Card>
          <LockKeyhole className="h-6 w-6 text-brand" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold text-ink">Confidențialitate</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Mesajele private sunt vizibile doar participanților. Administratorul nu are acces
            implicit la conversații. Datele sunt protejate prin Row Level Security în PostgreSQL.
          </p>
        </Card>
      </div>

      <section className="mt-14" aria-labelledby="verificare">
        <h2 id="verificare" className="text-3xl font-semibold text-ink">Cum verificăm profilele</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            {
              icon: Users,
              title: "1. Cont profesional",
              text: "Psihologul creează un cont și solicită activarea rolului profesional.",
            },
            {
              icon: UserCog,
              title: "2. Verificare administrativă",
              text: "Administratorul verifică identitatea și datele profesionale înainte de a acorda rolul.",
            },
            {
              icon: BadgeCheck,
              title: "3. Profil completat",
              text: "Psihologul completează studiile, specializările și cabinetele.",
            },
            {
              icon: ShieldCheck,
              title: "4. Aprobare publicare",
              text: "Profilul devine public numai după aprobare. Insigna „Verificat” marchează această etapă.",
            },
          ].map((step) => (
            <Card key={step.title} className="p-5">
              <step.icon className="h-5 w-5 text-brand" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </Card>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-sm text-muted">
          Verificarea administrativă nu echivalează cu acreditarea oficială a unei persoane și nu
          garantează calitatea serviciului. Utilizatorul este încurajat să verifice independent
          calificările afișate.
        </p>
      </section>

      <section className="mt-14" aria-labelledby="roluri">
        <h2 id="roluri" className="text-3xl font-semibold text-ink">Trei roluri, permisiuni separate</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <h3 className="text-lg font-semibold text-ink">Client</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Caută psihologi după specializare și oraș.</li>
              <li>Trimite mesaje private și primește notificări.</li>
              <li>Stabilește direct detaliile și tariful cu psihologul.</li>
              <li>Își exportă datele sau solicită ștergerea contului.</li>
            </ul>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-ink">Psiholog</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Își administrează profilul profesional.</li>
              <li>Își descrie studiile, specializările și cabinetele.</li>
              <li>Comunică privat cu persoanele care îi scriu.</li>
              <li>Stabilește direct tariful, în funcție de complexitate.</li>
            </ul>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-ink">Administrator</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Gestionează conturi, roluri și specializări.</li>
              <li>Aprobă profilurile profesionale.</li>
              <li>Poate suspenda conturi, cu motiv și jurnal de audit.</li>
              <li>Nu primește automat acces la conversații private.</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="date">
        <h2 id="date" className="text-3xl font-semibold text-ink">Date și limite</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <Database className="h-5 w-5 text-brand" aria-hidden="true" />
            <h3 className="mt-3 text-lg font-semibold text-ink">Minimizarea datelor</h3>
            <p className="mt-2 text-sm text-muted">
              Colectăm datele necesare contului, profilului profesional și mesageriei. Nu colectăm
              CNP, date medicale, date de plată sau conținutul ședințelor. Jurnalele tehnice nu
              includ parole, tokenuri sau mesaje.
            </p>
          </Card>
          <Card>
            <ShieldCheck className="h-5 w-5 text-brand" aria-hidden="true" />
            <h3 className="mt-3 text-lg font-semibold text-ink">Securitate tehnică</h3>
            <p className="mt-2 text-sm text-muted">
              Autentificarea este gestionată de Supabase Auth. Accesul la date este verificat în
              baza de date prin RLS, iar operațiunile sensibile trec prin funcții verificate pe
              server. Cheia de serviciu nu este expusă în browser.
            </p>
          </Card>
        </div>
      </section>

      <div className="mt-14 rounded-[2rem] border border-brand-line bg-surface p-8">
        <h2 className="text-2xl font-semibold text-ink">Pentru psihologi</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Îți poți crea contul, completa profilul și trimite spre verificare. Profilul nu devine
          public automat. Platforma nu gestionează programări sau plăți; clienții te contactează
          prin mesagerie, iar tariful se stabilește direct.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/inregistrare?tip=psiholog" className={buttonClasses("primary")}>
            Solicită cont profesional
          </Link>
          <Link href="/contact" className={buttonClasses("secondary")}>
            Întrebări despre verificare
          </Link>
        </div>
      </div>
    </div>
  );
}
