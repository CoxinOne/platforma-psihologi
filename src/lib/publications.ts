export interface FeaturedPublication {
  title: string;
  description: string;
  href: string;
  year: string;
  kind: string;
}

/**
 * Lucrări de specialitate puse în evidență pe profilul public.
 * Sursa conținutului este pagina dedicată din /resurse, nu un fișier descărcabil.
 */
export const FEATURED_PUBLICATIONS: Record<string, FeaturedPublication> = {
  "sima-narcis-constantin": {
    title:
      "De la co-reglare la autoreglare: rolul specialiștilor în dezvoltarea capacității de reglare emoțională a copilului",
    description:
      "O lucrare de specialitate despre felul în care copiii învață să își gestioneze emoțiile, despre co-reglare, autoreglare și intervenția potrivită în momentele dificile.",
    href: "/resurse/de-la-co-reglare-la-autoreglare",
    year: "2026",
    kind: "Lucrare de specialitate",
  },
};
