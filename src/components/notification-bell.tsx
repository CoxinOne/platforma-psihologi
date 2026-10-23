"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/public-env";

export function NotificationBell({
  userId,
  initialNotifications,
  initialMessages,
  href,
}: {
  userId: string;
  initialNotifications: number;
  initialMessages: number;
  href: string;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [messages, setMessages] = useState(initialMessages);
  const total = notifications + messages;

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    let active = true;

    const refresh = async () => {
      const { data } = await supabase.rpc("unread_badge");
      if (!active) return;
      const row = Array.isArray(data) ? data[0] : data;
      setNotifications(Number(row?.unread_notifications ?? 0));
      setMessages(Number(row?.unread_messages ?? 0));
    };

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <Link
      href={href}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-brand transition-colors hover:bg-brand-soft"
      aria-label={
        total > 0
          ? `Notificări: ${total} necitite`
          : "Notificări, niciuna necitită"
      }
    >
      <Bell className="h-4.5 w-4.5" aria-hidden="true" />
      {total > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[0.65rem] font-bold text-white"
        >
          {total > 99 ? "99+" : total}
        </span>
      ) : null}
    </Link>
  );
}
