# GDPR și protecția datelor

> **Actualizare 24.10.2026:** platforma nu mai colectează programări, disponibilitate sau tarife.
> Datele istorice din tabelele legacy pot exista în DB până la ștergere/curățare; nu sunt expuse în
> interfață. Secțiunile despre programări se citesc ca referință pentru schema legacy.

> Documentul este un **checklist tehnic**, nu o consultanță juridică. Implementarea nu garantează
> conformitatea; operatorul trebuie să completeze și să valideze elementele marcate.

## 1. Harta datelor

| Categorie | Unde | Scop | Temei posibil | Retenție propusă |
|---|---|---|---|---|
| Nume, email, parolă hash | `auth.users`, `profiles` | cont, autentificare | contract | durata contului |
| Telefon (opțional) | `profiles` | contact | consimțământ/contract | durata contului |
| Date profesionale | `psychologist_profiles` | profil public | contract/interes legitim | cât timp profilul este public |
| Mesaje private | `messages` | comunicare | contract | durata contului |
| Notificări | `notifications` | funcționare | contract/interes legitim | 12 luni (de stabilit) |
| Jurnale de audit | `audit_logs` | securitate | interes legitim/obligație | 12–24 luni (de stabilit) |
| Raportări abuz | `abuse_reports` | siguranță | interes legitim | până la soluționare + termen |
| Contact | `contact_messages` | răspuns solicitări | consimțământ/interes legitim | 12 luni (de stabilit) |
| IP/user-agent | jurnale infrastructură, `audit_logs.ip` | securitate | interes legitim | minim necesar |
| Consimțământ marketing | `profiles.marketing_consent` | comunicări | consimțământ | până la retragere |

Nu sunt colectate: CNP, date medicale, diagnostic, conținutul ședințelor, date de card.

## 2. Fluxuri GDPR implementate

- **Acces/export**: `/dashboard/confidentialitate` + `GET /api/account/export` (JSON).
- **Ștergere**: cerere în `data_requests`, procesată de administrator; ștergerea utilizatorului din
  Supabase Auth elimină în cascadă datele asociate. Unele date pot fi păstrate pentru obligații
  legale sau apărarea unor drepturi.
- **Retragerea consimțământului de marketing**: bifă în profil; se înregistrează
  `marketing_consent_at`.
- **Consimțământ cookie**: doar cookie-uri esențiale; preferința este locală, în browser.
- **Raportări**: flux separat, fără acces implicit al administratorului la conversații.

## 3. Retenție — de decis înainte de lansare

Aplicația **nu are** un job automat de ștergere/anonimizare. Trebuie stabilit și implementat:

- durata pentru conturi inactive;
- durata pentru mesaje după închiderea contului;
- durata pentru `audit_logs` și `contact_messages`;
- durata pentru backup-uri (Supabase PITR/backups);
- procedura de anonimizare vs. ștergere;
- excepțiile legale (ex. apărarea unor drepturi, obligații fiscale).

Până atunci, cererile se procesează manual, iar ștergerea este hard-delete.

## 4. Furnizori și transferuri

| Furnizor | Rol | Date | Observații |
|---|---|---|---|
| Supabase | procesator: DB, Auth, Storage, Realtime | toate datele aplicației | alege regiune UE; DPA; backup-uri |
| Hosting Next.js (Vercel/server) | procesator | date în tranzit, loguri | regiune UE; DPA |
| Resend | procesator: e-mail tranzacțional | adresă e-mail, text generic | fără conținutul mesajelor |
| Google Maps (link extern) | operator terț | adresă cabinet la click | link extern, nu embed; fără cookie până la click |

**Transferuri internaționale:** de evaluat în funcție de regiunea aleasă și de subprocesatori.
Dacă există transferuri în afara SEE, sunt necesare garanții (SCC/adecvare) și documentare.

## 5. Securitate și date sensibile

- Mesajele pot conține informații despre sănătate; sunt tratate ca date cu risc ridicat în evaluarea
  de impact.
- Accesul este limitat la participanți prin RLS; administratorul nu are politică de citire.
- Mesajele nu sunt trimise către servicii AI și nu sunt incluse în e-mailuri.
- Jurnalele tehnice nu conțin corpul mesajelor, parole sau tokenuri.
- Backup-urile trebuie criptate și accesibile doar rolurilor administrative; restaurează politici RLS
  și verifică integritatea.
- Nu există E2EE; compromisul cheii de serviciu sau al bazei de date expune mesajele.

## 6. Evaluare de impact (DPIA) — puncte de analizat

- natura și volumul datelor din mesagerie;
- persoane vulnerabile (inclusiv minori 16–18);
- riscul de acces neautorizat la conversații;
- măsuri: RLS, minimizare, retenție, audit, instruire, procedură de incident;
- necesitatea unui DPO și a unei evaluări formale.

## 7. Checklist înainte de lansare

- [ ] Operator, CUI, adresă, contact DPO completate în politică și termeni.
- [ ] Regiune Supabase/hosting în SEE; DPA semnate.
- [ ] Termene de retenție aprobate și implementate (job sau procedură manuală).
- [ ] Politica de confidențialitate verificată juridic.
- [ ] Termenii verificați juridic.
- [ ] Șabloanele de e-mail verificate (fără date sensibile).
- [ ] Procedura de răspuns la incidente și notificare ANSPDCP.
- [ ] Procedura pentru cereri de acces/ștergere și termenele legale.
- [ ] Informare privind cookie-urile și consimțământul.
- [ ] Verificarea identității pentru cererile de ștergere.
- [ ] Backup-uri criptate și test de restaurare.
- [ ] Ștergerea datelor demo.
- [ ] Evaluarea transferurilor internaționale.
- [ ] Instruirea administratorilor privind accesul la date.
