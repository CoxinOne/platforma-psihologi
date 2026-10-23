import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logServerError } from "@/lib/errors";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const userId = session.user.id;

    const [profile, psychologist, appointmentsAsClient, appointmentsAsPsychologist, conversations, notifications, reports, dataRequests, preferences] =
      await Promise.all([
        admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
        admin.from("psychologist_profiles").select("*").eq("user_id", userId).maybeSingle(),
        admin.from("appointments").select("*").eq("client_id", userId),
        admin.from("appointments").select("*").eq("psychologist_id", userId),
        admin
          .from("conversations")
          .select("id, client_id, psychologist_id, last_message_at, created_at")
          .or(`client_id.eq.${userId},psychologist_id.eq.${userId}`),
        admin.from("notifications").select("*").eq("user_id", userId),
        admin.from("abuse_reports").select("*").eq("reporter_id", userId),
        admin.from("data_requests").select("*").eq("user_id", userId),
        admin.from("notification_preferences").select("*").eq("user_id", userId).maybeSingle(),
      ]);

    const conversationIds = (conversations.data ?? []).map((item) => item.id as string);
    const { data: messages } =
      conversationIds.length > 0
        ? await admin
            .from("messages")
            .select("id, conversation_id, sender_id, body, created_at")
            .in("conversation_id", conversationIds)
            .order("created_at", { ascending: true })
        : { data: [] };

    const payload = {
      export_generated_at: new Date().toISOString(),
      notice:
        "Export al datelor tale din Platformă Psihologi. Nu conține parole, tokenuri sau date tehnice de securitate.",
      account: profile.data,
      notification_preferences: preferences.data,
      psychologist_profile: psychologist.data,
      appointments_as_client: appointmentsAsClient.data ?? [],
      appointments_as_psychologist: appointmentsAsPsychologist.data ?? [],
      conversations: conversations.data ?? [],
      messages: messages ?? [],
      notifications: notifications.data ?? [],
      abuse_reports: reports.data ?? [],
      data_requests: dataRequests.data ?? [],
    };

    await admin.from("audit_logs").insert({
      actor_id: userId,
      actor_role: session.profile.role,
      action: "data.exported",
      entity_type: "profile",
      entity_id: userId,
      metadata: { format: "json" },
    });

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="date-platforma-psihologi-${new Date()
          .toISOString()
          .slice(0, 10)}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logServerError("account.export", error);
    return NextResponse.json({ error: "Exportul nu a putut fi generat." }, { status: 500 });
  }
}
