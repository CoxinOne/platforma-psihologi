"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { humanizeError, logServerError } from "@/lib/errors";
import {
  adminAccountStatusSchema,
  adminCabinetSchema,
  adminDataRequestSchema,
  adminProfessionalStatusSchema,
  adminReportSchema,
  adminRoleSchema,
  adminSpecialtySchema,
  contactStatusSchema,
} from "@/lib/validation";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function failure(path: string, message: string): never {
  redirect(`${path}?eroare=${encodeURIComponent(message)}`);
}

async function audit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  const admin = createSupabaseAdminClient();

  await admin.from("audit_logs").insert({
    actor_id: actorId,
    actor_role: "admin",
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
}

export async function adminSetRoleAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const parsed = adminRoleSchema.safeParse({
    userId: formString(formData, "userId"),
    role: formString(formData, "role"),
  });
  if (!parsed.success) failure("/admin/conturi", "Datele rolului nu sunt valide.");

  const { error } = await session.supabase.rpc("admin_set_user_role", {
    p_user: parsed.data.userId,
    p_role: parsed.data.role,
  });
  if (error) {
    logServerError("admin.role", error);
    failure("/admin/conturi", humanizeError(error));
  }

  revalidatePath("/admin/conturi");
  revalidatePath("/admin");
  redirect("/admin/conturi?status=rol-actualizat");
}

export async function adminSetAccountStatusAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const parsed = adminAccountStatusSchema.safeParse({
    userId: formString(formData, "userId"),
    status: formString(formData, "status"),
    reason: formString(formData, "reason") || undefined,
  });
  if (!parsed.success) failure("/admin/conturi", "Datele de suspendare nu sunt valide.");
  if (parsed.data.status === "suspended" && (parsed.data.reason ?? "").length < 10) {
    failure("/admin/conturi", "Motivul suspendării este obligatoriu și trebuie să aibă minimum 10 caractere.");
  }

  const { error } = await session.supabase.rpc("admin_set_account_status", {
    p_user: parsed.data.userId,
    p_status: parsed.data.status,
    p_reason: parsed.data.reason ?? null,
  });
  if (error) {
    logServerError("admin.account-status", error);
    failure("/admin/conturi", humanizeError(error));
  }

  revalidatePath("/admin/conturi");
  revalidatePath("/admin");
  redirect(`/admin/conturi?status=${parsed.data.status === "suspended" ? "suspendat" : "reactivat"}`);
}

export async function adminSetProfessionalStatusAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const parsed = adminProfessionalStatusSchema.safeParse({
    userId: formString(formData, "userId"),
    status: formString(formData, "status"),
    reason: formString(formData, "reason") || undefined,
  });
  if (!parsed.success) failure("/admin/profesionisti", "Datele profilului nu sunt valide.");

  const { error } = await session.supabase.rpc("admin_set_professional_status", {
    p_user: parsed.data.userId,
    p_status: parsed.data.status,
    p_reason: parsed.data.reason ?? null,
  });
  if (error) {
    logServerError("admin.professional-status", error);
    failure("/admin/profesionisti", humanizeError(error));
  }

  revalidatePath("/admin/profesionisti");
  revalidatePath("/admin");
  revalidatePath("/psihologi");
  revalidatePath("/");
  redirect(`/admin/profesionisti?status=${parsed.data.status}`);
}

export async function adminSaveSpecialtyAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = formString(formData, "id");
  const parsed = adminSpecialtySchema.safeParse({
    name: formString(formData, "name"),
    slug: formString(formData, "slug"),
    description: formString(formData, "description") || undefined,
    sortOrder: formString(formData, "sortOrder") || "100",
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    failure("/admin/specializari", parsed.error.issues[0]?.message ?? "Date invalide.");
  }

  const admin = createSupabaseAdminClient();
  const payload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    sort_order: parsed.data.sortOrder,
    is_active: parsed.data.isActive,
  };

  const { error } = id
    ? await admin.from("specialties").update(payload).eq("id", id)
    : await admin.from("specialties").insert(payload);

  if (error) {
    logServerError("admin.specialty.save", error);
    failure(
      "/admin/specializari",
      error.code === "23505" ? "Slug-ul este deja folosit." : "Specializarea nu a putut fi salvată.",
    );
  }

  await audit(session.profile.id, id ? "admin.specialty.updated" : "admin.specialty.created", "specialty", id || parsed.data.slug);
  revalidatePath("/admin/specializari");
  revalidatePath("/specializari");
  revalidatePath("/");
  redirect("/admin/specializari?status=salvat");
}

export async function adminToggleSpecialtyAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = formString(formData, "id");
  const active = formString(formData, "active") === "true";
  if (!id) failure("/admin/specializari", "Specializarea nu a fost identificată.");

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("specialties").update({ is_active: active }).eq("id", id);
  if (error) {
    logServerError("admin.specialty.toggle", error);
    failure("/admin/specializari", "Starea nu a putut fi schimbată.");
  }

  await audit(session.profile.id, "admin.specialty.toggled", "specialty", id, { active });
  revalidatePath("/admin/specializari");
  revalidatePath("/specializari");
  redirect("/admin/specializari?status=actualizat");
}

export async function adminSaveCabinetAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = formString(formData, "id");
  const parsed = adminCabinetSchema.safeParse({
    name: formString(formData, "name"),
    slug: formString(formData, "slug"),
    addressLine: formString(formData, "addressLine"),
    city: formString(formData, "city"),
    county: formString(formData, "county") || undefined,
    postalCode: formString(formData, "postalCode") || undefined,
    phone: formString(formData, "phone") || undefined,
    description: formString(formData, "description") || undefined,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    failure("/admin/cabinete", parsed.error.issues[0]?.message ?? "Date invalide.");
  }

  const admin = createSupabaseAdminClient();
  const payload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    address_line: parsed.data.addressLine,
    city: parsed.data.city,
    county: parsed.data.county ?? null,
    postal_code: parsed.data.postalCode ?? null,
    phone: parsed.data.phone ?? null,
    description: parsed.data.description ?? null,
    is_active: parsed.data.isActive,
  };

  const { error } = id
    ? await admin.from("cabinets").update(payload).eq("id", id)
    : await admin.from("cabinets").insert(payload);

  if (error) {
    logServerError("admin.cabinet.save", error);
    failure(
      "/admin/cabinete",
      error.code === "23505" ? "Slug-ul este deja folosit." : "Cabinetul nu a putut fi salvat.",
    );
  }

  await audit(session.profile.id, id ? "admin.cabinet.updated" : "admin.cabinet.created", "cabinet", id || parsed.data.slug);
  revalidatePath("/admin/cabinete");
  revalidatePath("/cabinete");
  redirect("/admin/cabinete?status=salvat");
}

export async function adminToggleCabinetAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = formString(formData, "id");
  const active = formString(formData, "active") === "true";
  if (!id) failure("/admin/cabinete", "Cabinetul nu a fost identificat.");

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("cabinets").update({ is_active: active }).eq("id", id);
  if (error) {
    logServerError("admin.cabinet.toggle", error);
    failure("/admin/cabinete", "Starea nu a putut fi schimbată.");
  }

  await audit(session.profile.id, "admin.cabinet.toggled", "cabinet", id, { active });
  revalidatePath("/admin/cabinete");
  revalidatePath("/cabinete");
  redirect("/admin/cabinete?status=actualizat");
}

export async function adminUpdateReportAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const parsed = adminReportSchema.safeParse({
    reportId: formString(formData, "reportId"),
    status: formString(formData, "status"),
    note: formString(formData, "note") || undefined,
  });
  if (!parsed.success) failure("/admin/raportari", "Datele raportării nu sunt valide.");

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("abuse_reports")
    .update({
      status: parsed.data.status,
      resolution_note: parsed.data.note ?? null,
      handled_by: session.profile.id,
    })
    .eq("id", parsed.data.reportId);

  if (error) {
    logServerError("admin.report.update", error);
    failure("/admin/raportari", "Raportarea nu a putut fi actualizată.");
  }

  await audit(session.profile.id, "admin.report.updated", "abuse_report", parsed.data.reportId, {
    status: parsed.data.status,
  });
  revalidatePath("/admin/raportari");
  redirect("/admin/raportari?status=actualizat");
}

export async function adminProcessDataRequestAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const parsed = adminDataRequestSchema.safeParse({
    requestId: formString(formData, "requestId"),
    status: formString(formData, "status"),
    note: formString(formData, "note") || undefined,
  });
  if (!parsed.success) failure("/admin/cereri", "Datele cererii nu sunt valide.");

  const { error } = await session.supabase.rpc("admin_process_data_request", {
    p_request: parsed.data.requestId,
    p_status: parsed.data.status,
    p_note: parsed.data.note ?? null,
  });
  if (error) {
    logServerError("admin.data-request", error);
    failure("/admin/cereri", humanizeError(error));
  }

  revalidatePath("/admin/cereri");
  redirect("/admin/cereri?status=actualizat");
}

export async function adminDeleteAccountAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const userId = formString(formData, "userId");
  const requestId = formString(formData, "requestId");
  if (!userId || userId === session.user.id) {
    failure("/admin/cereri", "Nu poți șterge propriul cont din acest flux.");
  }
  if (formString(formData, "confirmation") !== "sterge") {
    failure("/admin/cereri", "Scrie „sterge” pentru a confirma ștergerea contului.");
  }

  const admin = createSupabaseAdminClient();
  const { data: request } = await admin
    .from("data_requests")
    .select("id, type, status")
    .eq("id", requestId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!request || request.type !== "deletion" || !["pending", "processing"].includes(request.status)) {
    failure("/admin/cereri", "Nu există o cerere de ștergere validă pentru acest cont.");
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    logServerError("admin.delete-account", error);
    failure("/admin/cereri", "Contul nu a putut fi șters. Verifică cheia de serviciu.");
  }

  const audit = createSupabaseAdminClient();
  await audit.from("audit_logs").insert({
    actor_id: session.profile.id,
    actor_role: "admin",
    action: "admin.account.deleted",
    entity_type: "profile",
    entity_id: userId,
    metadata: { request_id: requestId },
  });

  revalidatePath("/admin/cereri");
  revalidatePath("/admin/conturi");
  redirect("/admin/cereri?status=sters");
}

export async function adminSetContactStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = contactStatusSchema.safeParse({    messageId: formString(formData, "messageId"),
    status: formString(formData, "status"),
  });
  if (!parsed.success) failure("/admin/mesaje", "Datele mesajului nu sunt valide.");

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("contact_messages")
    .update({
      status: parsed.data.status,
      handled_at: parsed.data.status === "new" ? null : new Date().toISOString(),
    })
    .eq("id", parsed.data.messageId);

  if (error) {
    logServerError("admin.contact.status", error);
    failure("/admin/mesaje", "Mesajul nu a putut fi actualizat.");
  }

  revalidatePath("/admin/mesaje");
  redirect("/admin/mesaje?status=actualizat");
}
