import { requireAdmin } from "@/lib/auth";
import { AppShell, type NavItem } from "@/components/app-shell";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { Alert } from "@/components/ui";

const NAV: NavItem[] = [
  { href: "/admin", label: "Sumar", icon: "home" },
  { href: "/admin/conturi", label: "Conturi", icon: "users" },
  { href: "/admin/profesionisti", label: "Profiluri profesionale", icon: "doctor" },
  { href: "/admin/specializari", label: "Specializări", icon: "briefcase" },
  { href: "/admin/cabinete", label: "Cabinete", icon: "briefcase" },
  { href: "/admin/raportari", label: "Raportări", icon: "report" },
  { href: "/admin/cereri", label: "Cereri GDPR", icon: "file" },
  { href: "/admin/mesaje", label: "Mesaje contact", icon: "message" },
  { href: "/admin/audit", label: "Jurnal de audit", icon: "shield" },
  { href: "/admin/sistem", label: "Sistem", icon: "settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const configured = isAdminClientConfigured();

  return (
    <AppShell
      areaLabel="Administrare"
      nav={NAV}
      user={{ id: session.user.id, fullName: session.profile.full_name, role: session.profile.role }}
      badges={{ notifications: 0, messages: 0 }}
      notificationsHref="/admin"
    >
      {configured ? (
        children
      ) : (
        <Alert tone="danger" title="Administrarea nu este configurată">
          Lipsește SUPABASE_SERVICE_ROLE_KEY. Fără cheia de serviciu, listele de conturi, aprobările
          și ștergerile nu pot fi efectuate. Completează variabila în .env.local și repornește
          aplicația. Consultă README, secțiunea „Configurare Supabase”.
        </Alert>
      )}
    </AppShell>
  );
}
