import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAvailableSlots } from "@/lib/data/public";
import { todayInZone, isValidDateInput } from "@/lib/time";

const querySchema = z.object({
  psychologist: z.uuid(),
  mode: z.enum(["online", "in_person"]),
  from: z.string().refine(isValidDateInput, "Data nu este validă."),
  days: z.coerce.number().int().min(1).max(31).default(14),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    psychologist: request.nextUrl.searchParams.get("psychologist") ?? "",
    mode: request.nextUrl.searchParams.get("mode") ?? "",
    from: request.nextUrl.searchParams.get("from") ?? todayInZone(),
    days: request.nextUrl.searchParams.get("days") ?? "14",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parametri invalizi." }, { status: 400 });
  }

  const days = await getAvailableSlots(
    parsed.data.psychologist,
    parsed.data.mode,
    parsed.data.from,
    parsed.data.days,
  );

  return NextResponse.json(
    { days },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
