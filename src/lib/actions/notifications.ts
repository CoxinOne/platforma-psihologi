"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const session = await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  await session.supabase.rpc("mark_notification_read", { p_notification: id });
  revalidatePath("/dashboard/notificari");
  revalidatePath("/cabinet/notificari");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await requireUser();
  await session.supabase.rpc("mark_all_notifications_read");
  revalidatePath("/dashboard/notificari");
  revalidatePath("/cabinet/notificari");
  revalidatePath("/", "layout");
}
