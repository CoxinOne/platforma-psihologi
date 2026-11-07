import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description:
    "Cum sunt prelucrate datele în platformă: categorii, temeiuri, destinatari, retenție și drepturi.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Politica de confidențialitate"
      intro="Această politică descrie modul în care platforma prelucrează datele personale ale clienților, psihologilor și vizitatorilor."
    >
      <h2>1. Operatorul de date</h2>
      <p>
        Operatorul va fi persoana juridică ce administrează platforma:{" "}
        <strong>[DE COMPLETAT: denumire, CUI, adresă, e-mail DPO/contact]</strong>. Până la
        completare, platforma funcționează ca mediu de dezvoltare și testare, nu ca serviciu public
        de producție.
      </p>

      <h2>2. Ce date prelucrăm</h2>
      <ul>
        <li>
          <strong>Date de cont:</strong> nume, adresă de e-mail, parolă stocată sub formă de hash de
          către Supabase Auth, rol, stare a contului, date de acceptare a termenilor.
        </li>
        <li>
          <strong>Date de contact opționale:</strong> număr de telefon, dacă îl adaugi în profil.
        </li>
        <li>
          <strong>Date profesionale publice:</strong> nume profesional, titlu, prezentare, studii,
          experiență, specializări, limbi, cabinete, durata ședinței.
        </li>
        <li>
          <strong>Mesaje private:</strong> conținutul conversațiilor dintre client și psiholog.
          Acestea sunt stocate pentru funcționarea serviciului și nu sunt analizate automat.
        </li>
        <li>
          <strong>Date tehnice:</strong> adresă IP și user-agent pentru limitarea abuzurilor și
          jurnale de securitate, în măsura în care sunt colectate de infrastructură.
        </li>
        <li>
          <strong>Formular de contact:</strong> nume, e-mail, subiect și mesaj.
        </li>
      </ul>

      <h2>3. Scopuri și temeiuri juridice</h2>
      <ul>
        <li>
          <strong>Furnizarea serviciului</strong> (cont și mesagerie) — executarea
          contractului, art. 6 alin. (1) lit. b) GDPR.
        </li>
        <li>
          <strong>Securitate, prevenirea abuzurilor, jurnale administrative</strong> — interes
          legitim, art. 6 alin. (1) lit. f) GDPR.
        </li>
        <li>
          <strong>Comunicări de marketing</strong> — consimțământ separat, art. 6 alin. (1) lit. a)
          GDPR, atunci când este solicitat.
        </li>
        <li>
          <strong>Obligații legale</strong> — art. 6 alin. (1) lit. c) GDPR, dacă legea impune
          păstrarea anumitor date.
        </li>
      </ul>
      <p>
        Datele din mesajele private pot avea legătură cu sănătatea. Platforma nu solicită astfel de
        date și recomandă transmiterea lor doar în cadrul ședinței, prin canalele agreate de
        psiholog. Temeiul pentru prelucrarea mesajelor este furnizarea serviciului de comunicare
        solicitat de utilizator.
      </p>

      <h2>4. Destinatari și furnizori</h2>
      <ul>
        <li>
          <strong>Supabase</strong> — găzduirea bazei de date PostgreSQL, autentificare și storage.
          Regiunea proiectului trebuie aleasă în UE; contractul de prelucrare și eventualele
          transferuri trebuie evaluate înainte de lansare.
        </li>
        <li>
          <strong>Furnizorul de hosting</strong> pentru aplicația Next.js —{" "}
          <strong>[DE COMPLETAT: furnizor, regiune, DPA]</strong>.
        </li>
        <li>
          <strong>Resend</strong> — trimiterea e-mailurilor tranzacționale, dacă este configurat.
          E-mailurile nu includ conținutul mesajelor private.
        </li>
        <li>
          <strong>Autorități publice</strong> — doar la solicitare legală și în limitele legii.
        </li>
      </ul>
      <p>
        Nu vindem date și nu le folosim pentru profilare comercială. Mesajele private nu sunt
        trimise către servicii AI externe.
      </p>

      <h2>5. Transferuri internaționale</h2>
      <p>
        Locația de găzduire se configurează la crearea proiectului Supabase și la alegerea
        furnizorului de hosting. Dacă datele ajung în afara Spațiului Economic European, trebuie
        încheiate garanții adecvate (decizie de adecvare sau clauze contractuale standard) și
        documentată evaluarea transferului. Această evaluare este{" "}
        <strong>[DE COMPLETAT ÎNAINTE DE LANSARE]</strong>.
      </p>

      <h2>6. Retenție</h2>
      <p>
        Datele contului și mesajele sunt păstrate cât timp contul este activ. La ștergerea
        contului, datele asociate sunt eliminate prin cascade din baza de date, cu excepția
        jurnalelor de securitate care pot fi păstrate pentru o perioadă limitată, fără conținut
        privat. Termenele exacte și procesul de ștergere periodică trebuie aprobate și verificate
        înainte de producție.
      </p>
      <p>
        Solicitările de export sau ștergere sunt înregistrate în cont și procesate de administrator.
        Unele date pot fi păstrate dacă există o obligație legală sau un temei legitim pentru
        apărarea unor drepturi.
      </p>

      <h2>7. Drepturile tale</h2>
      <ul>
        <li>Acces la date și copie a acestora.</li>
        <li>Rectificarea datelor inexacte.</li>
        <li>Ștergerea datelor, în limitele legii.</li>
        <li>Restricționarea prelucrării și opoziția la prelucrarea bazată pe interes legitim.</li>
        <li>Portabilitatea datelor furnizate.</li>
        <li>Retragerea consimțământului, fără a afecta prelucrările anterioare.</li>
        <li>
          Depunerea unei plângeri la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu
          Caracter Personal (ANSPDCP).
        </li>
      </ul>
      <p>
        Îți poți exercita drepturile din cont, la pagina „Confidențialitate”, sau prin formularul de
        contact. Vom răspunde în termenul legal aplicabil.
      </p>

      <h2>8. Securitate</h2>
      <p>
        Accesul la date este controlat prin politici RLS, verificări de rol pe server și funcții
        dedicate. Parolele nu sunt stocate în clar. Cheia de serviciu este folosită exclusiv pe
        server. Jurnalele nu includ parole, tokenuri sau conținutul mesajelor. Nicio măsură tehnică
        nu elimină complet riscul; incidentele de securitate se tratează conform procedurii
        operatorului.
      </p>

      <h2>9. Minori</h2>
      <p>
        Contul este destinat persoanelor de cel puțin 16 ani. Pentru persoanele sub această vârstă
        este necesară implicarea unui reprezentant legal, conform regulilor aplicabile. Platforma nu
        colectează intenționat date ale copiilor fără acordul unui adult.
      </p>

      <h2>10. Cookie-uri</h2>
      <p>
        Folosim cookie-uri esențiale pentru autentificare și securitatea sesiunii. Nu sunt
        configurate instrumente de analiză sau marketing. Detalii și opțiuni în pagina de{" "}
        <a href="/consimtamant">gestionare a consimțământului</a>.
      </p>
    </LegalPageShell>
  );
}
