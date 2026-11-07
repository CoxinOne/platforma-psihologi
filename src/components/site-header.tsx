"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, UserRound, X } from "lucide-react";
import type { UserRole } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/constants";
import { roleHome } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/actions/auth";
import { Button, buttonClasses } from "@/components/ui";
import { NotificationBell } from "@/components/notification-bell";

const NAV_ITEMS = [
  { href: "/psihologi", label: "Psihologi" },
  { href: "/cauta", label: "Caută" },
  { href: "/specializari", label: "Specializări" },
  { href: "/cabinete", label: "Cabinete" },
  { href: "/despre", label: "Despre" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  user,
  badges,
}: {
  user: { id: string; fullName: string; role: UserRole } | null;
  badges: { notifications: number; messages: number };
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const notificationsHref =
    user?.role === "psychologist"
      ? "/cabinet/notificari"
      : user?.role === "admin"
        ? "/admin"
        : "/dashboard/notificari";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Platformă Psihologi — pagina principală">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-display text-lg font-semibold text-cream"
          >
            P
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[1.05rem] font-semibold tracking-tight text-ink">
              Platformă Psihologi
            </span>
            <span className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">
              sprijin, cu claritate
            </span>
          </span>
        </Link>

        <nav aria-label="Navigare principală" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-brand-soft text-brand-strong"
                  : "text-muted hover:bg-brand-soft/60 hover:text-brand",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell
                userId={user.id}
                initialNotifications={badges.notifications}
                initialMessages={badges.messages}
                href={notificationsHref}
              />
              <details className="group relative hidden sm:block">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-2 pr-3 text-sm font-medium text-ink transition-colors hover:bg-brand-soft [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand"
                  >
                    {user.fullName
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("")}
                  </span>
                  <span className="max-w-32 truncate">{user.fullName}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                </summary>
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-line bg-surface p-2 shadow-xl">
                  <p className="px-3 py-2 text-xs text-muted">{ROLE_LABELS[user.role]}</p>
                  <Link
                    href={roleHome(user.role)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink hover:bg-brand-soft"
                  >
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    Contul meu
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink hover:bg-brand-soft"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Deconectare
                    </button>
                  </form>
                </div>
              </details>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/autentificare" className={buttonClasses("ghost", "sm")}>
                Autentificare
              </Link>
              <Link href="/inregistrare" className={buttonClasses("primary", "sm")}>
                Creează cont
              </Link>
            </div>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="meniu-mobil"
            aria-label={mobileOpen ? "Închide meniul" : "Deschide meniul"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div id="meniu-mobil" className="border-t border-line bg-canvas px-4 pb-6 pt-3 lg:hidden">
          <nav aria-label="Navigare mobilă" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-medium",
                  isActive(item.href) ? "bg-brand-soft text-brand-strong" : "text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
            {user ? (
              <>
                <Link
                  href={roleHome(user.role)}
                  onClick={() => setMobileOpen(false)}
                  className={buttonClasses("secondary", "md")}
                >
                  Contul meu
                </Link>
                <Link
                  href={notificationsHref}
                  onClick={() => setMobileOpen(false)}
                  className={buttonClasses("ghost", "md")}
                >
                  Notificări
                </Link>
                <form action={signOutAction}>
                  <Button type="submit" variant="ghost" size="md" className="w-full">
                    Deconectare
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/autentificare"
                  onClick={() => setMobileOpen(false)}
                  className={buttonClasses("secondary", "md")}
                >
                  Autentificare
                </Link>
                <Link
                  href="/inregistrare"
                  onClick={() => setMobileOpen(false)}
                  className={buttonClasses("primary", "md")}
                >
                  Creează cont
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
