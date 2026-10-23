"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { actionFailure, actionSuccess, humanizeError, logServerError, type ActionResult } from "@/lib/errors";

export async function requestDataExportAction(
  _previous: ActionResult | null,
  _formData: FormData,
): Promise<ActionResult> {
  const session = await requireUser("/dashboard/confidentialitate");
  const { error } = await session.supabase.rpc("request_data_export");

  if (error) {
    logServerError("gdpr.export-request", error);
    return actionFailure(humanizeError(error));
  }

  revalidatePath("/dashboard/confidentialitate");
  return actionSuccess();
}

export async function requestAccountDeletionAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireUser("/dashboard/confidentialitate");
  const reason = formData.get("reason");
  const confirmation = formData.get("confirmation");

  if (confirmation !== "sterge") {
    return actionFailure("Scrie „sterge” pentru a confirma solicitarea.");
  }

  const { error } = await session.supabase.rpc("request_account_deletion", {
    p_reason: typeof reason === "string" && reason.trim() ? reason.trim() : null,
  });

  if (error) {
    logServerError("gdpr.deletion-request", error);
    return actionFailure(humanizeError(error));
  }

  revalidatePath("/dashboard/confidentialitate");
  return actionSuccess();
}
