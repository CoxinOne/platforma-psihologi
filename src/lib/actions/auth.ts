"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerConfig } from "@/lib/server-env";
import { actionFailure, actionSuccess, humanizeError, logServerError, type ActionResult } from "@/lib/errors";
import { collectFieldErrors, forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema } from "@/lib/validation";
import { nextAfterLogin } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signInAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    next: formString(formData, "next") || undefined,
  });

  if (!parsed.success) {
    return actionFailure("Verifică datele introduse.", collectFieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return actionFailure(humanizeError(error));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return actionFailure("Profilul contului nu a putut fi încărcat. Contactează administratorul.");
  }

  if (profile.status !== "active") {
    await supabase.auth.signOut();
    return actionFailure(
      profile.status === "suspended"
        ? "Contul este suspendat. Contactează administratorul platformei."
        : "Contul nu este activ.",
    );
  }

  const target = nextAfterLogin(profile.role as UserRole, parsed.data.next);
  redirect(target);
}

export async function signUpAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    fullName: formString(formData, "fullName"),
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    confirmPassword: formString(formData, "confirmPassword"),
    terms: formData.get("terms") === "on",
    ageConfirm: formData.get("ageConfirm") === "on",
  });

  if (!parsed.success) {
    return actionFailure("Verifică datele introduse.", collectFieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const config = getServerConfig();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${config.siteUrl}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
      data: {
        full_name: parsed.data.fullName,
        terms_accepted_at: new Date().toISOString(),
      },
    },
  });

  if (error) {
    logServerError("auth.signup", error);
    return actionFailure(humanizeError(error));
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect(`/verifica-email?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function forgotPasswordAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formString(formData, "email") });
  if (!parsed.success) {
    return actionFailure("Verifică adresa de e-mail.", collectFieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const config = getServerConfig();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${config.siteUrl}/auth/callback?next=${encodeURIComponent("/resetare-parola")}`,
  });

  if (error) {
    logServerError("auth.forgot-password", error);
  }

  return actionSuccess();
}

export async function resetPasswordAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    password: formString(formData, "password"),
    confirmPassword: formString(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return actionFailure("Verifică datele introduse.", collectFieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionFailure("Linkul de resetare a expirat. Solicită un link nou.");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return actionFailure(humanizeError(error));
  }

  redirect("/dashboard?status=parola-actualizata");
}

export async function resendConfirmationAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formString(formData, "email") });
  if (!parsed.success) {
    return actionFailure("Verifică adresa de e-mail.", collectFieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const config = getServerConfig();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${config.siteUrl}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
    },
  });

  if (error) {
    logServerError("auth.resend-confirmation", error);
  }

  return actionSuccess();
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
