# SEO — plan realist pentru vizibilitate în Google

> Context: obiectivul „primul rezultat la căutarea *psihologi*" nu poate fi garantat și, pe termen
> scurt, nu este realist pentru un domeniu nou. Cuvântul-cheie este un „head term" național,
> dominat de directoare vechi, cu sute/mii de backlink-uri și trafic acumulat de peste un deceniu.
> Strategia de față urmărește rezultate măsurabile pe termen mediu, în special pe căutări locale și
> pe coadă lungă, plus structura tehnică necesară pentru a putea crește.

## 1. Ce este implementat în cod

- **Metadata per pagină** (title, description, canonical, Open Graph, Twitter card) pentru prima
  pagină, directoriu, orașe, specializări, cabinete, ghiduri și profiluri.
- **Open Graph image** generat local (`public/og-image.jpg`, 1200×630) — folosit la distribuirea pe
  rețele sociale și în rezultatele care afișează imagini.
- **Date structurate JSON-LD**:
  - `Organization` + `WebSite` (cu `SearchAction`) în layout-ul global;
  - `CollectionPage` + `ItemList` + `BreadcrumbList` pe listări;
  - `ProfessionalService` + `areaServed` pe paginile de oraș;
  - `Person` + `BreadcrumbList` pe profiluri;
  - `Article` + `BreadcrumbList` pe ghiduri.
- **Pagini programatice oraș × specializare** — `/psihologi/oras/{oras}/{specializare}` — generate
  doar când există cel puțin un profil aprobat pentru combinația respectivă (fără pagini goale).
- **Interlinking**: homepage → orașe/specializări; oraș → specializările disponibile în oraș;
  specializare → orașele în care există specialiști; profil → specializări; ghiduri → directoriu.
- **Sitemap dinamic** cu pagini statice, profiluri, specializări, orașe și combinații oraș ×
  specializare; `robots.txt` actualizat; paginile de autentificare/utilitare sunt excluse.
- **Pagina `/cauta`** (rezultate de căutare) este `noindex, follow` — nu aduce valoare ca pagină
  indexată și poate genera conținut subțire/duplicat.
- **Ghiduri de conținut** (`/resurse`) cu două articole utile despre alegerea psihologului și
  diferența online/cabinet — bază pentru autoritate topicală și trafic pe coadă lungă.

## 2. Ce trebuie făcut în afara codului (acțiuni obligatorii)

Acestea nu pot fi făcute din cod, pentru că necesită conturile tale:

1. **Google Search Console** (obligatoriu):
   - Verifică domeniul `psihologipentrufamilie.com` (Domain property) prin DNS TXT sau fișier HTML.
   - Dacă folosești metoda meta tag: setează în Vercel variabila
     `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` cu valoarea din Search Console și redeployează.
   - Trimite `https://www.psihologipentrufamilie.com/sitemap.xml`.
   - Verifică săptămânal: Pages → indexed / not indexed, Performance → impressions, clicks, poziții.
2. **Google Business Profile** (pentru căutările locale, inclusiv „psiholog Pitești"): creează/revendică
   profilul pentru fiecare cabinet, cu adresă reală, telefon, program, categorie „Psiholog" /
   „Psihoterapeut", link către pagina de oraș. Local SEO aduce adesea primele rezultate concrete.
3. **Google Analytics 4 / Search Console legat de GA4** (opțional, dar recomandat) pentru a măsura
   conversațiile: click pe profil, mesaje trimise, apeluri.
4. **Backlink-uri reale** (fără spam/farm-link-uri): asociații profesionale, universități, cabinete
   partenere, directoare medicale serioase, presă locală, articole invitate, parteneriate cu
   psihologii înscriși. Fiecare psiholog poate linkui profilul său de pe propriul site/GBP.
5. **Conținut recurent**: 2–4 materiale/lună pe subiecte reale căutate (ex. „terapie de cuplu
   Pitești", „psiholog pentru copii Argeș", „anxietate — când mergi la psiholog", „cum alegi
   psihologul online"). Fără texte generate în masă și fără promisiuni de vindecare.
6. **Recenzii reale** (opțional, doar cu consimțământ): pe Google Business Profile, nu inventate.
7. **Viteză/Core Web Vitals**: dacă planul Vercel permite, mută funcțiile în regiunea UE
   (`fra1`/Frankfurt) — în prezent funcția rulează în `iad1` (SUA), ceea ce crește TTFB pentru
   vizitatorii din România (~500–700 ms măsurat). Monitorizează în Search Console → Core Web Vitals.

## 3. Ținte realiste și prioritizare

| Prioritate | Cuvinte-cheie | Orizont | Observații |
|---|---|---|---|
| 1 | psiholog Pitești, psihologi Pitești, psiholog cuplu Pitești | 1–3 luni | competiție locală moderată; contează GBP + pagina de oraș |
| 2 | psiholog copii/adolescenți Pitești, parenting Pitești, terapie de cuplu Argeș | 2–4 luni | pagini oraș × specializare deja create |
| 3 | psiholog online România, consiliere online | 3–6 luni | nevoie de conținut + linkuri |
| 4 | psihologi (național, head term) | 6–18+ luni | realist doar cu autoritate/backlink-uri puternice; poziția 1 nu se poate promite |

## 4. Măsurare

- Search Console → Performance: impresii, click-uri, CTR, poziție medie pe interogări.
- Coverage/indexare: pagini indexate, excluse, erori.
- GA4: click-uri pe butonul de contact/mesaj, timp pe pagină.
- Concluzie: decizii pe date, nu pe intuiție; conținutul fără cerere nu aduce trafic.

## 5. Ce nu facem

- Nu cumpărăm linkuri/spam SEO, nu folosim texte duplicate, nu promitem vindecări și nu publicăm
  recenzii inventate — risc de penalizare Google și problemă legală/etică.
- Nu garantăm poziția 1 pentru „psihologi": nimeni nu poate garanta asta în mod onest.
