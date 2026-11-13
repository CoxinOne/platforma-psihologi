"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Bell } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/public-env";
import { LEGACY_APPOINTMENT_NOTIFICATION_TYPES } from "@/lib/constants";

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
    setNotifications(initialNotifications);
    setMessages(initialMessages);
  }, [initialNotifications, initialMessages]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;
    let channel: RealtimeChannel | null = null;
    let supabase: ReturnType<typeof createSupabaseBrowserClient> | null = null;

    const refresh = async () => {
      if (!supabase) return;
      const [{ data }, { count }] = await Promise.all([
        supabase.rpc("unread_badge"),
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .is("read_at", null)
          .not("type", "in", `(${LEGACY_APPOINTMENT_NOTIFICATION_TYPES.join(",")})`),
      ]);
      if (!active) return;
      const row = Array.isArray(data) ? data[0] : data;
      setNotifications(count ?? Number(row?.unread_notifications ?? 0));
      setMessages(Number(row?.unread_messages ?? 0));
    };

    const connect = async () => {
      supabase = createSupabaseBrowserClient();
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await supabase.realtime.setAuth(data.session.access_token);
        }
      } catch {
        // Reîncărcarea paginii rămâne fallback-ul.
      }
      if (!active) return;

      channel = supabase
        .channel(`notifications-${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications" },
          (payload) => {
            if ((payload.new as { user_id?: string }).user_id !== userId) return;
            void refresh();
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "notifications" },
          (payload) => {
            if ((payload.new as { user_id?: string }).user_id !== userId) return;
            void refresh();
          },
        )
        .subscribe();
    };

    void connect();

    return () => {
      active = false;
      if (channel && supabase) void supabase.removeChannel(channel);
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
          className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[0.65rem] font-bold text-cream"
        >
          {total > 99 ? "99+" : total}
        </span>
      ) : null}
    </Link>
  );
}
