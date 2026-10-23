import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth-forms";
import { Alert, buttonClasses } from "@/components/ui";

export const metadata: Metadata = {
  title: "Setează o parolă nouă",
};

export default async function ResetPasswordPage() {
  let hasSession = false;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    hasSession = Boolean(user);
  } catch {
    hasSession = false;
  }

  if (!hasSession) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-ink">Link invalid sau expirat</h1>
          <Alert tone="warning" className="mt-4">
            Pentru a seta o parolă nouă, deschide linkul primit prin e-mail sau solicită unul nou.
          </Alert>
          <Link href="/parola-uitata" className={`${buttonClasses("primary")} mt-6`}>
            Solicită un link nou
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold text-ink">Parolă nouă</h1>
        <p className="mt-2 text-sm text-muted">
          Alege o parolă puternică. Vei fi deconectat de pe celelalte dispozitive după schimbare.
        </p>
        <div className="mt-6">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
