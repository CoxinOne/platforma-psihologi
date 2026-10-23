import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const started = Date.now();

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("profiles").select("id").limit(1);

    if (error) {
      return NextResponse.json(
        { status: "degraded", database: false, email: Boolean(process.env.RESEND_API_KEY) },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        database: true,
        latency_ms: Date.now() - started,
        email_configured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
        timezone: process.env.PLATFORM_TIMEZONE ?? "Europe/Bucharest",
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { status: "degraded", database: false, configuration: false },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
