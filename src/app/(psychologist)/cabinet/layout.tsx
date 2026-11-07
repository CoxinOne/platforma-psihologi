import { requirePsychologist } from "@/lib/auth";
import { getUnreadBadge } from "@/lib/data/user";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV: NavItem[] = [
  { href: "/cabinet", label: "Sumar", icon: "home" },
  { href: "/cabinet/mesaje", label: "Mesaje", icon: "message", badge: "messages" },
  { href: "/cabinet/notificari", label: "Notificări", icon: "bell", badge: "notifications" },
  { href: "/cabinet/profil", label: "Profil profesional", icon: "user" },
  { href: "/cabinet/raportari", label: "Raportări", icon: "report" },
];

export default async function PsychologistLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePsychologist();
  const badges = await getUnreadBadge(session.supabase);

  return (
    <AppShell
      areaLabel="Cabinet"
      nav={NAV}
      user={{ id: session.user.id, fullName: session.profile.full_name, role: session.profile.role }}
      badges={badges}
      notificationsHref="/cabinet/notificari"
    >
      {children}
    </AppShell>
  );
}
