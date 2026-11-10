# Producție — date necesare pentru lansare

Site-ul nu mai folosește date demonstrative. Pentru lansarea reală avem nevoie de datele de mai jos.
Le pot introduce direct în Supabase și pot verifica apoi profilurile publice.

## 1. Administrator

- Nume complet:
- Adresă de e-mail pentru login:
- Parolă temporară (sau o generez eu):
- Adresă de e-mail publică pentru contact:
- Telefon public:

## 2. Date juridice

- Denumirea operatorului / cabinetului:
- Forma juridică (SRL, PFA, cabinet individual etc.):
- CUI / CIF:
- Număr Registrul Comerțului / alt număr:
- Adresă sediu:
- Reprezentant legal:
- DPO (dacă există) / e-mail DPO:
- Domeniul final al site-ului:
- Furnizor e-mail tranzacțional (Resend) și adresa expeditorului:

## 3. Psihologi — câte un set pentru fiecare din cei 12

Pentru fiecare persoană:

- Nume complet:
- Adresă de e-mail pentru cont:
- Parolă temporară (sau o generez eu):
- Titlu profesional:
- Slug dorit (ex. `ana-popescu`; îl pot genera eu):
- Prezentare / bio (80–6000 caractere):
- Studii și calificări:
- Experiență profesională:
- Număr de înregistrare profesională:
- Limbi vorbite:
- Tip consultații: `online`, `în cabinet` sau ambele:
- Durată ședință (minute):
- Specializări (din lista platformei):
- Cabinet: nume, adresă, oraș, județ, cod poștal, telefon:
- Număr WhatsApp public:
- Fotografie (JPEG/PNG/WebP, maximum 2 MB) sau „fără fotografie”:
- Acceptă clienți noi: da/nu:

Specializările disponibile în platformă:

`adictii`, `consiliere-cuplu`, `dezvoltare-personala`, `evaluare-psihologica`, `anxietate`,
`depresie`, `psihologie-clinica`, `psihologie-copil-adolescent`,
`psihoterapie-cognitiv-comportamentala`, `psihoterapie-psihodinamica`,
`psihoterapie-sistemica`, `psihotraumatologie`.

## 4. Setări tehnice

- Confirmarea adresei de e-mail în Supabase: da/nu.
- Site URL și Redirect URLs în Supabase Auth:
  - `https://platforma-psihologi.vercel.app`
  - domeniul custom, dacă există.
- Cheie Resend + adresa `EMAIL_FROM`.
- Domeniu custom în Vercel (opțional).

## 5. Checklist de lansare

- [ ] Admin real creat și contul demo eliminat.
- [ ] Datele juridice completate în termeni, confidențialitate și consimțământ.
- [ ] E-mailul de contact real setat în `NEXT_PUBLIC_CONTACT_EMAIL`.
- [ ] Cele 12 conturi și profiluri reale introduse.
- [ ] Fotografiile încărcate.
- [ ] Numerele WhatsApp reale setate pe cabinete.
- [ ] E-mailul tranzacțional configurat și testat.
- [ ] Site URL și redirect URLs verificate în Supabase.
- [ ] Backup al bazei de date înainte de lansare.
- [ ] Verificare finală: înregistrare client, mesaj, WhatsApp, aprobare profil, GDPR.
