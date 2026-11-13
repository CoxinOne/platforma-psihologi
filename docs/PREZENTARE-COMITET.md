# Prezentare pentru comitet — Platformă Psihologi

**Data:** 13 noiembrie 2026  
**Site live:** https://www.psihologipentrufamilie.com  
**Stadiu:** 11 profiluri publice din 12; site funcțional; lansare publică condiționată de datele juridice și administrative.

---

## 1. Mesajul de deschidere (30 de secunde)

> Am construit o platformă proprie pentru psihologii din comitet. Nu este doar o pagină de prezentare: are directoriu public, profiluri profesionale verificate, mesagerie privată, conturi separate pentru client, psiholog și administrator, plus administrare și protecție a datelor.
>
> Platforma nu gestionează programări, nu afișează tarife fixe și nu procesează plăți. Prețul se discută direct cu psihologul, în funcție de complexitate. Site-ul este live pe domeniul nostru și are deja 11 profiluri reale.

---

## 2. Ce am livrat, cap coadă

### Public

- Homepage, directoriu de psihologi, căutare cu filtre, specializări, cabinete, profiluri individuale.
- Pagini locale: Pitești, Curtea de Argeș, Bradu, Ștefănești.
- Pagini oraș × specializare, pagini pentru psihologi online.
- Profil complet: titlu, bio, studii, experiență, specializări, limbi, modalități de lucru, durată, cabinet, telefon, WhatsApp, site personal, motto.
- Buton „Trimite un mesaj” și buton WhatsApp.
- Formular de contact, pagini legale, banner de consimțământ.
- Ghiduri și hub de întrebări frecvente pentru pacienți.

### Conturi și roluri

- **Client:** înregistrare publică, căutare, mesaje private, notificări, export/ștergere date.
- **Psiholog:** cont creat de administrator, profil profesional, mesagerie privată, fără înregistrare publică.
- **Administrator:** conturi, roluri, aprobare/suspendare profiluri, cabinete, specializări, mesaje de contact, raportări, audit.
- Limită dură: **maximum 12 conturi de psiholog**.

### Mesagerie și notificări

- Mesaje private între client și psiholog.
- Notificări în aplicație.
- Administratorul nu are acces implicit la conversații.
- Mesajele nu pleacă prin e-mail și nu sunt trimise către servicii AI.

### Securitate și date

- Supabase Auth pentru autentificare.
- Row Level Security pe tabelele private.
- Operațiuni sensibile prin funcții PostgreSQL `security definer`.
- Fără CNP, date medicale, dosare clinice, date de card sau conținutul ședințelor.
- Export GDPR și cerere de ștergere.
- Politici de confidențialitate, termeni și consimțământ — șabloane de completat juridic.

### SEO și vizibilitate

- Metadata, canonical, Open Graph, Twitter card.
- JSON-LD pentru organizație, site, profiluri, listări și articole.
- Sitemap dinamic și `robots.txt`.
- Pagini locale și pagini oraș × specializare.
- Google Search Console verificat; sitemap trimis.
- Ghiduri și FAQ pentru trafic pe coadă lungă.

### Tehnic

- Next.js 16, React 19, TypeScript strict, Tailwind CSS 4.
- Supabase: PostgreSQL, Auth, Storage, Realtime.
- Vercel pentru hosting.
- Teste: 14 unitare, 27 SQL/RLS; typecheck, lint și build trec.
- Fără date demo; profilurile sunt reale.

---

## 3. Demonstrație în 3 minute

1. Homepage → directoriu → filtre.
2. Pagina unui oraș: `/psihologi/oras/pitesti`.
3. Profil psiholog: studii, specializări, cabinet, WhatsApp, mesaj.
4. Înregistrare client → trimitere mesaj.
5. Login psiholog → răspuns și notificare.
6. Admin → aprobare profil, roluri, cabinete.
7. Verificare preț: „Prețul este în funcție de complexitate.”

---

## 4. Ce este live acum

- 11 profiluri publice din 12.
- Domeniu propriu, HTTPS, redirect apex → www.
- Search Console verificat și sitemap trimis.
- 5 ghiduri, hub FAQ, pagini locale și oraș × specializare.
- E-mail tranzacțional configurat; livrarea reală depinde de finalizarea verificării domeniului la Resend.
- Contact public: `contact@psihologipentrufamilie.com`.

## 5. Ce mai trebuie înainte de lansarea publică

1. Ultimul profil de psiholog și eventuale corecturi de date.
2. Administrator real: nume, e-mail, parolă.
3. Date juridice: operator, CUI, sediu, reprezentant, DPO, contact.
4. Confirmarea căsuței `contact@...`.
5. Verificarea domeniului Resend și test de e-mail real.
6. Acordul psihologilor pentru fișe Google Business la cabinetele lor.
7. Conținut lunar și linkuri reale pentru SEO.

> Până la aceste completări, site-ul poate fi demonstrat, dar nu trebuie anunțat ca lansat public.

---

## 6. Ce cer comitetului

- Datele ultimului psiholog.
- Decizia privind operatorul și documentele juridice.
- Un administrator real, nu contul temporar.
- Confirmarea adresei publice de contact.
- Acordul pentru Google Business pe cabinete.
- Un responsabil de conținut și recenzii.
- Confirmarea bugetului pentru hosting, Supabase, domeniu și e-mail.

---

## 7. Întrebări probabile și răspunsuri

### „De ce nu aveți programări?”

Pentru că nu am vrut să promitem o funcție pe care nu o putem susține operațional și juridic. Programările ar aduce responsabilitate pentru calendar, anulări și date sensibile. Acum platforma facilitează contactul; programarea se face direct între client și psiholog. Putem adăuga programări într-o etapă următoare, cu un flux separat.

### „De ce nu afișați prețuri?”

Pentru că tariful depinde de complexitate și de tipul ședinței. Platforma nu procesează plăți și nu vrea să sugereze un preț standard. Afișăm explicit: „Prețul este în funcție de complexitate.”

### „Cum verificați psihologii?”

Conturile sunt create de administrator, nu prin înregistrare publică. Administratorul verifică identitatea și datele profesionale înainte de a acorda rolul și de a publica profilul. Insigna „Calificări verificate” apare numai după aprobare. Verificarea administrativă nu echivalează cu acreditarea oficială.

### „Ce se întâmplă cu datele sensibile?”

Nu colectăm dosare clinice, diagnostice sau conținutul ședințelor. Mesajele private sunt vizibile doar participanților, prin RLS. Administratorul nu are acces implicit la conversații. Există export și ștergere. Mesageria poate conține totuși date despre sănătate, deci este nevoie de DPIA, DPO și proceduri înainte de lansare.

### „Cât costă?”

Costurile sunt pe servicii: domeniu, Vercel, Supabase, Resend. La început pot fi mici; cresc cu traficul, storage-ul și backup-urile. Nu există costuri de programări sau plăți pentru că aceste funcții nu există.

### „Vom fi primii în Google?”

Nu putem promite locul 1 pentru „psihologi”. Este un termen național foarte competitiv. Putem obține rezultate pe căutări locale — „psiholog Pitești”, „psiholog Curtea de Argeș”, „terapie de cuplu Pitești” — cu pagini locale, Google Business pe cabinete, conținut și linkuri. SEO durează luni, nu zile.

### „Cine răspunde de conținut?”

Fiecare psiholog își administrează profilul; administratorul aprobă. Pentru articole și Google Business este nevoie de un responsabil editorial și de acordul fiecărui cabinet.

### „Ce facem cu al 12-lea psiholog?”

Îl adăugăm când primim datele complete. Limita este impusă în baza de date; nu se pot crea mai mult de 12 conturi de psiholog.

---

## 8. Ce să nu spui

- „Suntem primii în Google” — nu este adevărat și nu poate fi garantat.
- „Platforma oferă terapie” — platforma pune în legătură, nu oferă servicii medicale.
- „Avem recenzii” — nu avem recenzii inventate.
- „Datele sunt complet protejate juridic” — documentele sunt șabloane, trebuie validate.
- „E gata de lansare publică” — mai lipsesc administratorul real, datele juridice și e-mailul.

---

## 9. Închidere

> Am construit infrastructura completă, am publicat 11 profiluri reale și am pregătit terenul pentru vizibilitate. Ce mai depinde de comitet sunt deciziile juridice, administratorul real, ultimul profil și acordul pentru Google Business. După acestea, putem intra în etapa de lansare și creștere.
