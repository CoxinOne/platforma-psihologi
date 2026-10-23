# Testare

## 1. Comenzi

```powershell
npm run typecheck
npm run lint
npm test
npm run test:db
npm run build
```

`npm run check` rulează typecheck + lint + teste unitare + build (fără testele DB, care necesită
PostgreSQL/Docker).

## 2. Rezultate (24 octombrie 2026)

Mediu: Windows 11, Node 24.15.0, npm 11.12.1, PostgreSQL 18.4 (local), Next.js 16.4.3.

| Verificare | Rezultat | Detalii |
|---|---|---|
| `tsc --noEmit` | ✅ | 0 erori, `strict` + `noUncheckedIndexedAccess` |
| `eslint .` | ✅ | 0 erori, 0 warnings |
| `vitest run tests/unit` | ✅ | 15 teste |
| `vitest run tests/db` | ✅ | 24 teste |
| `next build` | ✅ | compilare + TypeScript + toate rutele |

### Teste unitare (15)

- conversii UTC ↔ Europe/Bucharest înainte/după DST;
- generare de intervale fără duplicate în ziua cu ora 03:00 inexistentă;
- pas de 30 de minute și durată de 50;
- formatare în română;
- validare strictă a datelor calendaristice (`2027-02-29` respins);
- redirectări sigure (blochează `//evil`, URL-uri absolute, backslash);
- fereastra de anulare de 24 h;
- schema de înregistrare (email normalizat, parolă slabă, confirmare, termeni);
- profil/telefon;
- cabinet obligatoriu pentru `in_person`;
- traducerea erorilor cunoscute.

### Teste DB/RLS (23)

Vezi tabelul din [`SECURITATE-RLS.md`](SECURITATE-RLS.md#6-teste-rulate-2323). Rulează pe un
PostgreSQL real, cu stub Supabase (`auth.uid()`, roluri, `auth.users`) și toate migrațiile aplicate.

## 3. Teste care nu au putut fi rulate

| Zonă | Motiv | Ce trebuie făcut |
|---|---|---|
| End-to-end pe Supabase găzduit | lipsă credențiale de proiect | creează proiect, aplică migrațiile, rulează fluxurile |
| Trimitere e-mail reală | lipsă cheie Resend/SMTP | configurează și verifică primirea |
| Realtime între două browsere | necesită proiect Supabase | deschide două conturi, verifică mesajele live |
| Storage upload | necesită bucket real | încarcă o fotografie și verifică politicile |
| Teste de browser (Playwright) | neincluse | adaugă pentru fluxurile critice |
| Scanare de securitate externă | neefectuată | pentest înainte de lansare |

## 4. Observații despre testele DB

- `scripts/db-setup.mjs` creează un container PostgreSQL 17 efemer și aplică migrațiile. Nu folosește
  o bază de producție.
- Pentru un PostgreSQL local, setează `TEST_DATABASE_URL` și rulează `db-setup.mjs` pe o bază **goală**.
- Testele creează utilizatori fictivi, dezactivează temporar trigger-ele de protecție pentru fixture-uri
  și le reactivează imediat.
- Testele de concurență folosesc două conexiuni reale și commit-uri secvențiale; exact o rezervare
  reușește.
- Nu se folosesc date personale reale.

## 5. Interpretarea rezultatelor

- Testele DB validează RLS-ul și logica SQL, nu configuranța proiectului Supabase (Realtime,
  Storage, Auth SMTP).
- Un build reușit nu înseamnă că toate fluxurile funcționează cu serviciile externe; vezi lista de
  mai sus.
- Rezultatele nu au fost modificate manual; comenzile pot fi rerulate.
