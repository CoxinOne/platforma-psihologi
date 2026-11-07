import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal";

export const metadata: Metadata = {
  title: "Termeni de utilizare",
  description: "Condițiile de utilizare a platformei pentru clienți, psihologi și administratori.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Termeni de utilizare"
      intro="Acești termeni stabilesc regulile de utilizare a platformei. Ei nu înlocuiesc contractul dintre client și psiholog și nu constituie consultanță medicală."
    >
      <h2>1. Operator și obiect</h2>
      <p>
        Platforma este operată de <strong>[DE COMPLETAT: operator]</strong> și oferă infrastructură
        pentru prezentarea profilurilor profesionale și mesagerie privată. Platforma nu este
        furnizor de servicii medicale, nu programează ședințe și nu intermediază plăți.
      </p>

      <h2>2. Conturi și roluri</h2>
      <ul>
        <li>Contul de client se activează după confirmarea adresei de e-mail.</li>
        <li>
          Contul de psiholog se activează numai după verificarea de către administrator. Simpla
          înregistrare nu conferă statutul de psiholog și nu garantează publicarea profilului.
        </li>
        <li>Rolurile nu pot fi modificate de utilizator. Modificarea se face exclusiv de administrator, cu audit.</li>
        <li>Utilizatorul este responsabil de confidențialitatea parolei și de activitatea din cont.</li>
      </ul>

      <h2>3. Profiluri profesionale</h2>
      <p>
        Psihologul este responsabil de exactitatea datelor profesionale și a calificărilor
        publicate. Platforma poate solicita documente justificative și poate respinge sau suspenda
        un profil dacă informațiile nu pot fi verificate ori încalcă regulile. Insigna „Verificat”
        confirmă o verificare administrativă, nu acreditarea oficială și nu garantează rezultatul
        serviciului.
      </p>

      <h2>4. Comunicare și tarife</h2>
      <ul>
        <li>Platforma facilitează contactul prin mesagerie, nu programarea automată a ședințelor.</li>
        <li>
          Nu există programări online, calendar de rezervări sau plată online în această versiune.
        </li>
        <li>
          Prețul este în funcție de complexitate. Tariful se discută direct între client și
          psiholog, înainte de a stabili o întâlnire.
        </li>
        <li>
          Eventuala plată și organizarea întâlnirii se fac în afara platformei, direct între părți.
        </li>
        <li>Platforma nu percepe comision și nu procesează date de card.</li>
      </ul>

      <h2>5. Mesagerie privată</h2>
      <p>
        Mesajele sunt vizibile exclusiv participanților. Este interzisă folosirea mesageriei pentru
        spam, hărțuire, amenințări, conținut ilegal sau solicitarea de date financiare. Utilizatorii
        pot raporta abuzuri prin fluxul dedicat. Administratorul nu citește conversațiile în mod
        obișnuit; accesul poate fi justificat doar în cadrul unei investigații legale, cu respectarea
        legii.
      </p>

      <h2>6. Conduită interzisă</h2>
      <ul>
        <li>Accesarea datelor altor utilizatori sau încercarea de a ocoli măsurile de securitate.</li>
        <li>Furnizarea de informații false despre identitate sau calificări.</li>
        <li>Automatizarea abuzivă a cererilor, colectarea de date sau trimiterea de mesaje nesolicitate.</li>
        <li>Publicarea de conținut ilegal, discriminatoriu sau care încalcă drepturile altor persoane.</li>
        <li>Folosirea platformei pentru urgențe medicale sau pentru situații de risc iminent.</li>
      </ul>

      <h2>7. Suspendare și închidere</h2>
      <p>
        Conturile pot fi suspendate pentru încălcarea termenilor, risc de securitate sau obligații
        legale. Măsura se înregistrează în jurnalul de audit. Utilizatorul poate solicita ștergerea
        contului; procesarea se face în limitele legale, iar unele date pot fi păstrate pentru
        apărarea unor drepturi sau obligații legale.
      </p>

      <h2>8. Răspundere</h2>
      <p>
        Platforma facilitează contactul, dar nu controlează conținutul ședințelor, nu stabilește
        tarife și nu răspunde pentru actul profesional al psihologului. În limitele permise de lege,
        răspunderea operatorului pentru funcționarea tehnică este limitată la serviciul efectiv
        furnizat. Această clauză trebuie verificată juridic înainte de publicare.
      </p>

      <h2>9. Proprietate intelectuală</h2>
      <p>
        Elementele platformei, codul, textele și identitatea vizuală aparțin operatorului sau
        titularilor respectivi. Datele introduse de utilizator rămân ale acestuia, cu licența
        necesară afișării lor în platformă.
      </p>

      <h2>10. Modificări și lege aplicabilă</h2>
      <p>
        Termenii pot fi actualizați; modificările importante sunt anunțate în platformă. Se aplică
        legislația română, iar litigiile se soluționează pe cale amiabilă sau de instanțele
        competente. Data intrării în vigoare și datele operatorului sunt{" "}
        <strong>[DE COMPLETAT]</strong>.
      </p>
    </LegalPageShell>
  );
}
