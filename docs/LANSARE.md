# Lansare

> **Actualizare 24.10.2026:** verificările de programări/plăți nu se mai aplică. Platforma oferă
> profiluri publice și mesagerie privată; tariful se discută direct, în funcție de complexitate.

## 1. Checklist tehnic

- [ ] `npm ci` pe o mașină curată.
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — toate trec.
- [ ] `npm run test:db` pe o bază goală (Docker sau PostgreSQL local).
- [ ] Migrațiile aplicate pe proiectul Supabase de producție (`supabase db push`).
- [ ] `NEXT_PUBLIC_SITE_URL` este domeniul HTTPS real.
- [ ] Redirect URLs Supabase: `/auth/callback` (și `/auth/confirm` dacă folosești token hash).
- [ ] SMTP configurat în Supabase; șabloanele de confirmare/resetare testate.
- [ ] `RESEND_API_KEY` și `EMAIL_FROM` configurate (sau mesajul „neconfigurat” acceptat).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` există doar în secrets server-side.
- [ ] Primul administrator creat prin procedura SQL din README.
- [x] Datele demo au fost șterse.
- [ ] Bucket `avatars` creat și politicile verificate.
- [ ] Publicația Realtime verificată.
- [ ] `GET /api/health` răspunde 200.
- [ ] Backup-uri active și test de restaurare.
- [ ] Logs fără date sensibile; alertare pentru erori 5xx.

## 2. Verificări funcționale manuale

1. Înregistrare client → e-mail → confirmare → autentificare.
2. Resetare parolă.
3. Psiholog: cont public de client → admin promovează rolul (maximum 12) → profil → trimitere spre
   verificare → admin aprobă → profil public.
4. Client: căutare → mesaj privat → psiholog răspunde → notificări la ambele conturi.
5. Verifică afișarea „Prețul este în funcție de complexitate” pe card, profil și dashboard.
6. Admin: suspendare cont → login blocat → reactivare.
7. Export GDPR → JSON descărcat; cerere ștergere → admin șterge contul.
8. Raportare abuz → admin o vede → o închide.
9. Upload fotografie → apare pe profilul public.
10. Verificare acces: un client nu poate deschide `/admin` sau `/cabinet`; rutele de programări nu
    mai există.

## 3. Verificări juridice și operaționale

- [ ] Operator, DPO, temeiuri, retenție, transferuri — completate și verificate.
- [ ] Contracte DPA cu Supabase, hosting, Resend.
- [ ] Politica de confidențialitate și termenii verificați.
- [ ] Procedură de incident și notificare.
- [ ] Procedură de verificare a identității pentru cereri GDPR.
- [ ] Reguli clare pentru verificarea calificărilor psihologilor.
- [ ] Procedură de suspendare și contestare.
- [ ] Limită de vârstă și implicarea reprezentantului legal.
- [ ] Informare „nu este serviciu de urgență” vizibilă.

## 4. Costuri și servicii

- Supabase: plan în funcție de utilizatori, storage, backup-uri.
- Hosting Next.js: plan potrivit traficului.
- Resend: plan pentru volumul de e-mailuri.
- Monitorizare erori (ex. Sentry) — **neconfigurată** în proiect.
- Backups și PITR — în responsabilitatea planului Supabase ales.

## 5. După lansare

- Monitorizează `/api/health`, erorile 5xx și latența.
- Verifică periodic politicile RLS și accesul rolurilor.
- Rotește cheia de serviciu dacă a fost expusă.
- Șterge datele demo și conturile de test.
- Stabilește un proces pentru profilurile raportate și suspendate.
- Documentează fiecare acces administrativ la date sensibile.
