"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";

export function AutoMarkNotificationsRead({ unread }: { unread: number }) {
  const router = useRouter();

  useEffect(() => {
    if (unread <= 0) return;
    let active = true;
    void markAllNotificationsReadAction().then(() => {
      if (active) router.refresh();
    });
    return () => {
      active = false;
    };
  }, [unread, router]);

  return null;
}
