import type { Metadata } from "next";
import { ConsentSettings } from "@/components/consent";
import { LegalPageShell } from "@/components/legal";

export const metadata: Metadata = {
  title: "Consimțământ și cookie-uri",
  description:
    "Informații despre cookie-urile esențiale, consimțământul pentru marketing și opțiunile salvate.",
};

export default function ConsentPage() {
  return (
    <LegalPageShell
      title="Consimțământ și cookie-uri"
      intro="Această pagină explică ce tipuri de cookie-uri folosim și cum poți controla preferințele salvate în browser."
    >
      <h2>1. Cookie-uri esențiale</h2>
      <p>
        Sunt necesare pentru autentificare, menținerea sesiunii și securitatea contului. Fără ele,
        platforma nu poate funcționa. Sunt setate de Supabase Auth și de infrastructura aplicației.
      </p>

      <h2>2. Analiză și marketing</h2>
      <p>
        În versiunea actuală nu este configurat niciun instrument de analiză, publicitate sau
        urmărire. Dacă va fi introdus, va fi activat doar după un consimțământ explicit și după
        actualizarea acestei pagini și a politicii de confidențialitate.
      </p>

      <h2>3. Comunicări de marketing</h2>
      <p>
        Consimțământul pentru e-mailuri de marketing este separat de crearea contului și poate fi
        modificat oricând din profilul tău. Notificările tranzacționale (de exemplu, confirmarea
        unei programări) nu depind de consimțământul de marketing.
      </p>

      <h2>4. Preferințele tale în acest browser</h2>
      <div className="not-prose my-6">
        <ConsentSettings />
      </div>

      <h2>5. Retragerea consimțământului</h2>
      <p>
        Poți retrage oricând preferința salvată, folosind butonul de mai sus. Retragerea nu afectează
        legalitatea prelucrărilor efectuate anterior. Pentru ștergerea contului, folosește pagina de
        confidențialitate din cont sau formularul de contact.
      </p>
    </LegalPageShell>
  );
}
