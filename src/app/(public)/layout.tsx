import { getSessionContext } from "@/lib/auth";
import { getUnreadBadge } from "@/lib/data/user";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionContext().catch(() => null);
  const badges = session
    ? await getUnreadBadge(session.supabase).catch(() => ({ notifications: 0, messages: 0 }))
    : { notifications: 0, messages: 0 };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        user={
          session
            ? {
                id: session.user.id,
                fullName: session.profile.full_name,
                role: session.profile.role,
              }
            : null
        }
        badges={badges}
      />
      <main id="continut" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
