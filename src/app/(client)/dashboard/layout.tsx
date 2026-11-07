import { requireClient } from "@/lib/auth";
import { getUnreadBadge } from "@/lib/data/user";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Sumar", icon: "home" },
  { href: "/dashboard/mesaje", label: "Mesaje", icon: "message", badge: "messages" },
  { href: "/dashboard/notificari", label: "Notificări", icon: "bell", badge: "notifications" },
  { href: "/dashboard/profil", label: "Profil", icon: "user" },
  { href: "/dashboard/confidentialitate", label: "Confidențialitate", icon: "shield" },
  { href: "/dashboard/raportari", label: "Raportări", icon: "report" },
];

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireClient();
  const badges = await getUnreadBadge(session.supabase);

  return (
    <AppShell
      areaLabel="Contul meu"
      nav={NAV}
      user={{ id: session.user.id, fullName: session.profile.full_name, role: session.profile.role }}
      badges={badges}
      notificationsHref="/dashboard/notificari"
    >
      {children}
    </AppShell>
  );
}
