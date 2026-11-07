"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  FileWarning,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
  Briefcase,
  ClipboardList,
} from "lucide-react";
import type { ReactNode } from "react";
import type { UserRole } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/constants";
import { signOutAction } from "@/lib/actions/auth";
import { NotificationBell } from "@/components/notification-bell";
import { cn } from "@/lib/utils";

export type NavIcon =
  | "home"
  | "calendar"
  | "message"
  | "bell"
  | "user"
  | "shield"
  | "users"
  | "briefcase"
  | "settings"
  | "file"
  | "report"
  | "sparkles"
  | "doctor";

const ICONS = {
  home: LayoutDashboard,
  calendar: CalendarDays,
  message: MessageCircle,
  bell: Bell,
  user: UserRound,
  shield: ShieldCheck,
  users: Users,
  briefcase: Briefcase,
  settings: Settings,
  file: ClipboardList,
  report: FileWarning,
  sparkles: Sparkles,
  doctor: Stethoscope,
} as const;

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
  badge?: "messages" | "notifications";
}

export function AppShell({
  areaLabel,
  nav,
  user,
  badges,
  notificationsHref,
  children,
}: {
  areaLabel: string;
  nav: NavItem[];
  user: { id: string; fullName: string; role: UserRole };
  badges: { notifications: number; messages: number };
  notificationsHref: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === nav[0]?.href ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 lg:flex-col lg:items-stretch">
          <div>
            <Link href="/" className="text-xs font-semibold uppercase tracking-[0.16em] text-brand hover:underline">
              Platformă Psihologi
            </Link>
            <p className="mt-1 truncate font-display text-lg font-semibold text-ink">{user.fullName}</p>
            <p className="text-xs text-muted">{ROLE_LABELS[user.role]}</p>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <NotificationBell
              userId={user.id}
              initialNotifications={badges.notifications}
              initialMessages={badges.messages}
              href={notificationsHref}
            />
          </div>
        </div>

        <nav aria-label={`Navigare ${areaLabel}`} className="mt-3 grid min-w-0 grid-cols-2 gap-1 pb-2 lg:flex lg:flex-col lg:flex-nowrap lg:overflow-visible">
          {nav.map((item) => {
            const Icon = ICONS[item.icon];
            const badgeValue =
              item.badge === "messages"
                ? badges.messages
                : item.badge === "notifications"
                  ? badges.notifications
                  : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-brand text-cream"
                    : "text-muted hover:bg-brand-soft hover:text-brand",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{item.label}</span>
                {badgeValue > 0 ? (
                  <span
                    className={cn(
                      "ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[0.65rem] font-bold",
                      isActive(item.href) ? "bg-cream/20 text-cream" : "bg-danger text-cream",
                    )}
                  >
                    {badgeValue > 99 ? "99+" : badgeValue}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 hidden rounded-2xl border border-line bg-canvas p-4 text-xs text-muted lg:block">
          <LifeBuoy className="mb-2 h-4 w-4 text-brand" aria-hidden="true" />
          <p>
            Nu este un serviciu de urgență. Pentru situații critice sună la{" "}
            <a className="font-semibold text-brand underline" href="tel:112">
              112
            </a>
            .
          </p>
          <form action={signOutAction} className="mt-3">
            <button type="submit" className="font-semibold text-brand underline underline-offset-4">
              Deconectare
            </button>
          </form>
        </div>
      </aside>

      <main id="continut" className="min-w-0">
        {children}
      </main>
    </div>
  );
}
