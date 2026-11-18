import type { Metadata } from "next";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";
import { publicEnv } from "@/lib/public-env";
import { JsonLd } from "@/components/json-ld";

const PUBLISHED = "2026-11-18";
const MODIFIED = "2026-11-18";
const TITLE =
  "De la co-reglare la autoreglare: rolul specialiștilor în dezvoltarea capacității de reglare emoțională a copilului";
const SUBTITLE =
  "Cum învață copiii să își gestioneze emoțiile: mecanisme, dezvoltare și recomandări bazate pe cercetare";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Lucrare de specialitate despre reglarea emoțională la copii: co-reglare, autoreglare, strategii adaptate vârstei, rolul adultului și intervenția în criză. Autor: Sima Narcis Constantin.",
  alternates: { canonical: "/resurse/de-la-co-reglare-la-autoreglare" },
  openGraph: pageOpenGraph({
    title: TITLE,
    description: SUBTITLE,
    path: "/resurse/de-la-co-reglare-la-autoreglare",
  }),
};

const SECTIONS = [
  { id: "important", label: "De ce este importantă reglarea emoțională" },
  { id: "invata", label: "Cum învață copilul să își gestioneze emoțiile" },
  { id: "diferente", label: "Reglare, co-reglare și autoreglare" },
  { id: "strategie", label: "Cum alegem strategia potrivită" },
  { id: "invatare", label: "Cum este învățată o strategie" },
  { id: "singur", label: "De ce nu se poate calma întotdeauna singur" },
  { id: "specialisti", label: "Rolul specialiștilor și al familiei" },
  { id: "atasament", label: "Atașamentul și baza de siguranță" },
  { id: "criza", label: "Ce facem într-o criză emoțională" },
  { id: "bibliografie", label: "Bibliografie" },
] as const;

export default function CoRegulationPaperPage() {
  const baseUrl = publicEnv.siteUrl.replace(/\/$/, "");
  const pageUrl = absoluteUrl("/resurse/de-la-co-reglare-la-autoreglare");
  const profileUrl = absoluteUrl("/psihologi/sima-narcis-constantin");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${pageUrl}#article`,
              headline: TITLE,
              description: SUBTITLE,
              datePublished: PUBLISHED,
              dateModified: MODIFIED,
              inLanguage: "ro-RO",
              mainEntityOfPage: pageUrl,
              image: `${baseUrl}/og-image.jpg`,
              author: {
                "@type": "Person",
                name: "Sima Narcis Constantin",
                jobTitle: "Psiholog clinician principal",
                url: profileUrl,
              },
              publisher: { "@id": `${baseUrl}/#organization` },
              about: ["reglare emoțională", "co-reglare", "autoreglare", "copii", "parenting"],
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Acasă", item: baseUrl },
                { "@type": "ListItem", position: 2, name: "Resurse", item: `${baseUrl}/resurse` },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Reglare emoțională la copii",
                  item: pageUrl,
                },
              ],
            },
          ],
        }}
      />

      <nav aria-label="Firimituri" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/resurse" className="hover:text-brand">Resurse</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">Reglare emoțională la copii</li>
        </ol>
      </nav>

      <article>
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Lucrare de specialitate
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {TITLE}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{SUBTITLE}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-4 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4 text-brand" aria-hidden="true" />
              <Link href="/psihologi/sima-narcis-constantin" className="font-semibold text-ink hover:text-brand">
                Sima Narcis Constantin
              </Link>
            </span>
            <span>Psiholog clinician principal</span>
            <span>·</span>
            <span>Publicat {PUBLISHED}</span>
          </div>
        </header>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-muted">
          <section className="rounded-2xl border border-brand-line bg-brand-soft/30 p-5">
            <p>
              Copilul nu învață să își gestioneze emoțiile pentru că i se spune „calmează-te”.
              Le învață treptat, în relație cu adulții, prin experiențe repetate de siguranță,
              sprijin și exersare. Această lucrare explică trecerea de la co-reglare la autoreglare
              și felul în care specialiștii și părinții pot susține dezvoltarea emoțională fără a
              transforma calmul într-o obligație.
            </p>
          </section>

          <nav aria-label="Cuprins" className="rounded-2xl border border-line bg-surface p-5 text-sm">
            <p className="font-semibold text-ink">Cuprins</p>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {SECTIONS.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-brand underline underline-offset-4">
                    {index + 1}. {section.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <section id="important" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-ink">1. De ce este importantă reglarea emoțională în copilărie?</h2>
            <p className="mt-3">
              Copilul învață să recunoască ce simte și să exprime emoțiile fără să îi rănească pe
              ceilalți. Își dezvoltă treptat capacitatea de a aștepta, de a opri o reacție
              impulsivă — control inhibitor — și de a încerca altă soluție când prima nu
              funcționează — flexibilitate cognitivă. Aceste abilități îl ajută în relațiile cu
              ceilalți, la învățare și în rezolvarea conflictelor.
            </p>
            <p className="mt-3">
              Când copilul nu dispune încă de strategii eficiente, pot apărea izbucniri intense,
              dificultăți de recuperare după frustrare, conflicte frecvente sau tendința de a evita
              situații dificile. Uneori apar retragere, îngrijorare sau dificultăți de concentrare.
              Aceste manifestări au cauze multiple și nu înseamnă automat o tulburare ori o lipsă de
              educație.
            </p>
            <p className="mt-3">
              Autoreglarea nu apare doar pentru că i se spune copilului „calmează-te”. El are nevoie
              să vadă cum adultul își gestionează emoțiile, să primească ajutor potrivit vârstei și
              să exerseze strategii în momente de liniște. În timp, părintele reduce sprijinul, iar
              copilul poate cere o pauză, solicita ajutor sau alege singur o reacție mai potrivită.
            </p>
            <p className="mt-3 font-semibold text-ink">
              Ținta: emoții recunoscute și gestionate, nu emoții eliminate.
            </p>
          </section>

          <section id="invata" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-ink">2. Cum învață copilul să își gestioneze emoțiile?</h2>
            <p className="mt-3">
              Autoreglarea se dezvoltă treptat. Copilul învață să își gestioneze furia, frica sau
              dezamăgirea prin maturizare, experiențe repetate și sprijinul celor din jur.
              Capacitatea de a recunoaște emoția, de a opri un impuls și de a alege o reacție nu
              apare dintr-o dată.
            </p>
            <p className="mt-3">
              La început, copilul are nevoie de siguranță și sprijin pentru a gestiona emoțiile
              intense. Treptat, părintele îl ajută să le recunoască, să le exprime în siguranță și
              să exerseze strategii pe care le va putea alege și singur.
            </p>
            <p className="mt-3">
              Un copil tăcut nu este neapărat un copil care se autoreglează. Progresul înseamnă că
              începe să își înțeleagă emoțiile, să ceară ajutor la nevoie, să se liniștească mai
              ușor și să revină la activitatea întreruptă.
            </p>
            <div className="mt-4 rounded-xl border border-line bg-surface p-4">
              <p className="font-semibold text-ink">Un exemplu simplu</p>
              <p className="mt-2">
                După ce pierde un joc, copilul poate plânge și cere ajutor. Asta nu înseamnă
                neapărat dependență, ci că încă învață să depășească frustrarea. Adultul vorbește
                calm, păstrează limita și rămâne aproape. Când copilul își recapătă controlul, îl
                ajută să găsească o soluție pentru data viitoare.
              </p>
            </div>
          </section>

          <section id="diferente" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-ink">3. Reglare emoțională, co-reglare și autoreglare</h2>
            <p className="mt-3">
              <strong className="text-ink">Reglarea emoțională</strong> este procesul prin care
              influențăm emoțiile pe care le trăim, intensitatea și durata lor, precum și felul în
              care le exprimăm, în funcție de situație și obiective. Reglarea nu înseamnă eliminarea
              emoțiilor neplăcute.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Co-reglarea emoțională</strong> apare atunci când
              adultul și copilul se influențează reciproc în încercarea de a gestiona o situație
              dificilă. Părintele observă reacția copilului și își adaptează tonul, ritmul, cuvintele
              sau apropierea. Răspunsul copilului arată dacă ajutorul este potrivit.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Autoreglarea emoțională</strong> este capacitatea, în
              dezvoltare, de a recunoaște propriile emoții, de a le gestiona intensitatea și de a
              alege reacții potrivite situației. Copilul învață să folosească strategii proprii și
              să ceară ajutor atunci când are nevoie.
            </p>
            <p className="mt-3">
              Un copil poate rămâne dezamăgit după o pierdere, dar reușește să continue jocul fără
              să arunce piesele. Când copilul se agită, părintele încetinește discuția și vorbește
              mai puțin. Dacă agitația scade, poate relua explicațiile. Nu urmărim doar calmarea
              imediată, ci posibilitatea de a alege o reacție potrivită în contexte diferite.
            </p>
            <p className="mt-3 font-semibold text-ink">
              Ținta dezvoltării emoționale este flexibilitatea, nu calmul permanent.
            </p>
          </section>

          <section id="strategie" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-ink">4. Cum alegem strategia potrivită pentru un copil?</h2>
            <p className="mt-3">
              Observăm starea: este agitat, speriat, trist, frustrat ori supraîncărcat fiziologic?
              Observăm corpul, comportamentul, contextul și ce s-a întâmplat înainte. Nu presupunem
              aceeași cauză pentru toate comportamentele negative.
            </p>
            <p className="mt-3">
              Stabilim obiectivul. Uneori este nevoie să reducem activarea, alteori copilul trebuie
              să exprime o nevoie, să tolereze așteptarea sau să rezolve o problemă. Nu urmărim
              calmul cu orice preț.
            </p>
            <p className="mt-3">
              Alegem strategia după vârsta de dezvoltare și preferințe. Oferim una sau două opțiuni
              și urmărim dacă ajută. Renunțăm la tehnicile care cresc disconfortul. Exercițiile de
              respirație și atingerea nu sunt universale.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="font-semibold text-ink">Furie și frustrare</p>
                <p className="mt-2">Siguranță și distanță dacă este necesar, mișcare sau pauză, apoi exprimarea nevoii și reluarea sarcinii pe pași mai mici.</p>
              </div>
              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="font-semibold text-ink">Anxietate</p>
                <p className="mt-2">Validăm teama, clarificăm ce este sigur și planificăm pași mici de apropiere de situația temută; evitarea permanentă poate menține anxietatea.</p>
              </div>
              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="font-semibold text-ink">Tristețe</p>
                <p className="mt-2">Oferim conectare, ascultare și spațiu pentru exprimare. Uneori copilul are nevoie de companie, nu de o tehnică de calmare.</p>
              </div>
            </div>
          </section>

          <section id="invatare" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-ink">5. Cum este învățată o strategie?</h2>
            <p className="mt-3">
              <strong className="text-ink">Modelare.</strong> Părintele arată ce face el când se
              enervează: „Simt că ridic vocea. Fac o pauză și revin”. Copilul vede o acțiune
              concretă. Adultul își asumă propria reglare.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Exersare ghidată.</strong> Strategia se repetă în joc sau
              în frustrări mici, când copilul poate asculta și încerca. Ajutorul include demonstrații
              și indicii simple. Nu introducem tehnici noi la vârful crizei.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Autonomie progresivă.</strong> Adultul trece de la
              explicație la semn discret, apoi la observare. Copilul alege și inițiază singur
              strategia tot mai des. Apreciem inițiativa și flexibilitatea, nu doar rezultatul.
            </p>
            <p className="mt-3 font-semibold text-ink">
              Secvența: demonstrație → practică împreună → indiciu discret → utilizare independentă.
            </p>
          </section>

          <section id="singur" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-ink">6. De ce copilul nu se poate calma întotdeauna singur?</h2>
            <p className="mt-3">
              Creierul este încă în dezvoltare. Abilitățile de a aștepta, de a ține minte o regulă
              și de a opri un impuls se dezvoltă treptat. De aceea, un copil poate cunoaște regula
              „nu lovim”, dar îi poate fi greu să o respecte când este copleșit de furie.
            </p>
            <p className="mt-3">
              Emoțiile intense îngreunează gândirea. Când copilul este foarte speriat sau furios,
              îi este mai greu să asculte explicații lungi și să găsească soluții. Într-o criză este
              mai util să reducem stimulii și să oferim siguranță decât să ținem o lecție despre
              reguli.
            </p>
            <p className="mt-3">
              Experiențele repetate îl ajută. Prin interacțiuni previzibile, copilul descoperă că
              emoțiile dificile pot fi tolerate și că există modalități de a reveni la echilibru.
              Contează felul în care adultul răspunde de obicei, nu o singură reacție într-o zi
              dificilă.
            </p>
            <p className="mt-3 font-semibold text-ink">
              În momentele de activare intensă, copilul are nevoie de sprijin înainte de explicații.
            </p>
          </section>

          <section id="specialisti" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-ink">7. Rolul specialiștilor și al familiei</h2>
            <p className="mt-3">
              Copilul învață privindu-i pe adulți. Copiii observă cum reacționează părinții când
              sunt contrariați, obosiți sau dezamăgiți. Un adult care spune „M-am enervat, iau o
              pauză și revin” oferă un model de reglare pe care copilul îl poate înțelege și imita.
            </p>
            <p className="mt-3">
              Contează cum răspundem la emoțiile copilului. Când emoția este recunoscută și copilul
              primește limite clare, are șanse să învețe atât să exprime ce simte, cât și să își
              controleze comportamentul. Ridiculizarea sau rușinarea pot opri protestul pe moment,
              fără să dezvolte această abilitate.
            </p>
            <p className="mt-3">
              Contează climatul întregii familii. Somnul, stresul, conflictele dintre adulți și
              sprijinul disponibil părinților influențează interacțiunile zilnice. Relația
              funcționează în ambele direcții: și dificultățile copilului pot crește stresul
              adultului, făcând reglarea mai dificilă pentru amândoi.
            </p>
            <p className="mt-3">
              Un specialist atent observă mai întâi ce s-a schimbat, apoi își adaptează răspunsul:
              reduce zgomotul, vorbește mai rar, oferă apropiere sau, dimpotrivă, puțin spațiu.
              Verifică dacă ajutorul funcționează și schimbă strategia dacă nu. A fi responsiv nu
              înseamnă să aplici de fiecare dată aceeași tehnică.
            </p>
          </section>

          <section id="atasament" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-ink">8. Atașamentul și baza de siguranță</h2>
            <p className="mt-3">
              Când este speriat sau copleșit, copilul caută o persoană de încredere. Dacă adultul
              îi răspunde într-un mod sensibil și previzibil, copilul se poate liniști și se poate
              întoarce la explorare. Apropierea de părinte și autonomia nu se exclud.
            </p>
            <p className="mt-3">
              Părintele nu trebuie să fie perfect. Sensibilitatea parentală înseamnă să observi
              semnalele copilului și să încerci să răspunzi potrivit. Uneori adultul greșește, este
              obosit sau înțelege târziu nevoia. Contează și capacitatea de a repara relația și de a
              reveni la copil.
            </p>
            <p className="mt-3">
              Un singur episod de plâns, un refuz al îmbrățișării sau faptul că un copil doarme
              separat nu arată ce tip de atașament are. Atașamentul este o caracteristică a relației,
              evaluată prin metode adecvate, nu o etichetă pusă după o criză.
            </p>
            <p className="mt-3 font-semibold text-ink">
              Siguranța relațională îi permite copilului să se îndepărteze și să exploreze, știind
              că poate reveni.
            </p>
          </section>

          <section id="criza" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-ink">9. Ce facem când copilul are o criză emoțională intensă?</h2>
            <p className="mt-3">
              Mai întâi avem grijă de siguranță. Dacă există risc de lovire, fugă sau autoagresare,
              protejăm copilul și persoanele din jur. Reducem zgomotul și stimulii inutili. Evităm
              amenințările, explicațiile lungi și încercarea de a obține imediat un răspuns verbal.
            </p>
            <p className="mt-3">
              Oferim sprijin simplu și previzibil. Tonul stabil, apropierea adaptată și câteva
              propoziții scurte pot fi mai ușor de urmărit decât o discuție. Nu forțăm îmbrățișarea,
              contactul vizual sau respirația dirijată dacă acestea cresc disconfortul. Limitele
              privind siguranța rămân clare.
            </p>
            <p className="mt-3">
              Revenim asupra episodului mai târziu. După calmare, încercăm să înțelegem ce a
              declanșat criza, ce a ajutat și ce ar putea fi schimbat. Exersăm alternative în
              momente liniștite. Dacă episoadele sunt frecvente, severe sau pun în pericol
              siguranța, este necesară o evaluare adecvată.
            </p>
            <div className="mt-4 rounded-xl border border-line bg-surface p-4">
              <p className="font-semibold text-ink">Ce putem spune</p>
              <p className="mt-2">„Sunt aici. Nu te las să te rănești. Te ajut să fii în siguranță.”</p>
            </div>
          </section>

          <section id="bibliografie" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-ink">10. Bibliografie</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Ainsworth, M. D. S., et al. (1978). <em>Patterns of Attachment</em>. Erlbaum.</li>
              <li>Barber, B. K. (1996). Parental psychological control. <em>Child Development</em>, 67, 3296–3319.</li>
              <li>Baumrind, D. (1966). Effects of authoritative parental control. <em>Child Development</em>, 37, 887–907.</li>
              <li>Bowlby, J. (1982). <em>Attachment and Loss, Vol. 1</em> (ed. rev.). Basic Books.</li>
              <li>Davies, P. T., &amp; Cummings, E. M. (1994). Marital conflict and child adjustment. <em>Psychological Bulletin</em>, 116, 387–411.</li>
              <li>Diamond, A. (2013). Executive functions. <em>Annual Review of Psychology</em>, 64, 135–168.</li>
              <li>Edler &amp; Valentino (2024). Parental self-regulation: systematic review.</li>
              <li>Eisenberg, N., Cumberland, A., &amp; Spinrad, T. L. (1998). Parental socialization of emotion. <em>Psychological Inquiry</em>, 9, 241–273.</li>
              <li>England-Mason et al. (2023). Emotion socialization parenting RCTs.</li>
              <li>Furlong, M., et al. (2012). Behavioural and cognitive-behavioural group-based parenting programmes. <em>Cochrane Database of Systematic Reviews</em>.</li>
              <li>Gross, J. J. (1998). The emerging field of emotion regulation. <em>Review of General Psychology</em>, 2, 271–299.</li>
              <li>Gunnar, M., &amp; Quevedo, K. (2007). The neurobiology of stress and development. <em>Annual Review of Psychology</em>, 58, 145–173.</li>
              <li>Kaminski, J. W., et al. (2008). A meta-analytic review of components associated with parent training program effectiveness. <em>Journal of Abnormal Child Psychology</em>, 36, 567–589.</li>
              <li>Kopp, C. B. (1982). Antecedents of self-regulation: A developmental perspective. <em>Developmental Psychology</em>, 18, 199–214.</li>
              <li>Leijten et al. (2019). Components of behavioral parenting programs.</li>
              <li>Leijten et al. (2026). Parenting for disruptive behavior: meta-analysis.</li>
              <li>Lin et al. (2024). Family factors, regulation, internalizing: meta-analysis.</li>
              <li>Morris, A. S., et al. (2007). The role of the family context in the development of emotion regulation. <em>Social Development</em>, 16, 361–388.</li>
              <li>Patterson, G. R. (1982). <em>Coercive Family Process</em>. Castalia.</li>
              <li>Pinquart, M. (2017). Associations of parenting dimensions and styles with externalizing problems. <em>Developmental Psychology</em>, 53, 873–932.</li>
              <li>Rutherford et al. (2015). Emotion regulation in parenthood.</li>
              <li>Thompson, R. A. (1994). Emotion regulation: A theme in search of definition. <em>Monographs of the SRCD</em>, 59, 25–52.</li>
              <li>Verhagen et al. (2024). Parent–child coregulation: systematic review.</li>
              <li>Wood, Bruner &amp; Ross (1976). Scaffolding / tutoring.</li>
              <li>Zahl-Olsen et al. (2023). Emotionally oriented parental interventions.</li>
            </ul>
          </section>

          <p className="rounded-xl border border-line bg-surface p-4 text-xs leading-relaxed text-muted">
            Material educativ. Nu înlocuiește evaluarea sau intervenția unui specialist și nu oferă
            sfaturi medicale individuale. Pentru situații de risc imediat, apelați serviciile de
            urgență.
          </p>
        </div>
      </article>
    </div>
  );
}
