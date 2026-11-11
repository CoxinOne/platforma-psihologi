import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const checkbox = z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean());

const optionalPhone = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .regex(/^[0-9+ ().-]{6,30}$/, "Numărul de telefon conține caractere nepermise.")
    .optional(),
);

const password = z
  .string()
  .min(10, "Parola trebuie să aibă cel puțin 10 caractere.")
  .max(72, "Parola poate avea cel mult 72 de caractere.")
  .regex(/[A-Za-zĂÂÎȘȚăâîșț]/, "Parola trebuie să conțină cel puțin o literă.")
  .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră.");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Adresa de e-mail este prea lungă.")
  .pipe(z.email("Adresa de e-mail nu este validă."));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Introdu parola.").max(72),
  next: z.string().optional(),
});

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Numele trebuie să aibă cel puțin 2 caractere.")
      .max(120, "Numele poate avea cel mult 120 de caractere."),
    email: emailSchema,
    password,
    confirmPassword: z.string(),
    terms: z.literal(true, { message: "Trebuie să accepți termenii și politica de confidențialitate." }),
    ageConfirm: z.literal(true, { message: "Confirmă că ai vârsta minimă necesară." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele nu coincid.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele nu coincid.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Numele este prea scurt.").max(120),
  phone: optionalPhone,
  marketingConsent: checkbox,
});

export const notificationPreferencesSchema = z.object({
  inApp: checkbox,
  emailMessages: checkbox,
});

export const psychologistProfileSchema = z.object({
  displayName: z.string().trim().min(2, "Numele profesional este prea scurt.").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Adresa profilului poate conține doar litere mici, cifre și cratime."),
  professionalTitle: z.string().trim().min(2, "Titlul profesional este obligatoriu.").max(160),
  bio: z.string().trim().max(6000, "Prezentarea este prea lungă.").optional(),
  education: z.string().trim().max(4000).optional(),
  experience: z.string().trim().max(4000).optional(),
  languages: z.array(z.string().trim().min(1).max(40)).min(1, "Selectează cel puțin o limbă."),
  modes: z.array(z.enum(["in_person", "online"])).min(1, "Selectează cel puțin un tip de consultație."),
  sessionDuration: z.coerce.number().int().min(20).max(120),
  timezone: z.string().min(1).max(80).default("Europe/Bucharest"),
  websiteUrl: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(300, "Adresa site-ului este prea lungă.")
      .regex(/^https?:\/\/\S+$/, "Adresa site-ului trebuie să înceapă cu http:// sau https://.")
      .optional(),
  ),
  motto: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(600, "Motto-ul poate avea cel mult 600 de caractere.").optional(),
  ),
  registryNumber: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(80, "Numărul de înregistrare este prea lung.").optional(),
  ),
  isAcceptingNewClients: checkbox,
  specialtyIds: z.array(z.uuid()).min(1, "Selectează cel puțin o specializare."),
  cabinetIds: z.array(z.uuid()).default([]),
  photoPath: z.preprocess(emptyToUndefined, z.string().max(300).optional()),
});

export const messageSchema = z.object({
  conversationId: z.uuid(),
  body: z
    .string()
    .trim()
    .min(1, "Mesajul nu poate fi gol.")
    .max(4000, "Mesajul poate avea cel mult 4000 de caractere."),
});

export const startConversationSchema = z.object({
  psychologistId: z.uuid(),
  body: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(4000, "Mesajul poate avea cel mult 4000 de caractere.").optional(),
  ),
});

export const reportAbuseSchema = z.object({
  reportedUserId: z.uuid(),
  conversationId: z.preprocess(emptyToUndefined, z.uuid().optional()),
  category: z.enum(["spam", "harassment", "inappropriate", "impersonation", "other"]),
  details: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(2000, "Detaliile pot avea cel mult 2000 de caractere.").optional(),
  ),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Numele este prea scurt.").max(120),
  email: emailSchema,
  subject: z.string().trim().min(2, "Subiectul este prea scurt.").max(160),
  message: z
    .string()
    .trim()
    .min(10, "Mesajul trebuie să aibă cel puțin 10 caractere.")
    .max(4000, "Mesajul poate avea cel mult 4000 de caractere."),
  website: z.string().max(0, "Cererea a fost respinsă.").optional().or(z.literal("")),
});

export const adminSpecialtySchema = z.object({
  name: z.string().trim().min(2, "Denumirea este prea scurtă.").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug invalid."),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: checkbox,
});

export const adminCabinetSchema = z.object({
  name: z.string().trim().min(2, "Denumirea este prea scurtă.").max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug invalid."),
  addressLine: z.string().trim().min(5, "Adresa este prea scurtă.").max(240),
  city: z.string().trim().min(2, "Orașul este obligatoriu.").max(80),
  county: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
  postalCode: z.preprocess(
    emptyToUndefined,
    z.string().regex(/^\d{6}$/, "Codul poștal trebuie să aibă 6 cifre.").optional(),
  ),
  phone: optionalPhone,
  description: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
  isActive: checkbox,
});

export const adminRoleSchema = z.object({
  userId: z.uuid(),
  role: z.enum(["client", "psychologist", "admin"]),
});

export const adminAccountStatusSchema = z.object({
  userId: z.uuid(),
  status: z.enum(["active", "suspended"]),
  reason: z.string().trim().max(1000).optional(),
});

export const adminProfessionalStatusSchema = z.object({
  userId: z.uuid(),
  status: z.enum(["draft", "pending", "approved", "rejected", "suspended"]),
  reason: z.string().trim().max(1000).optional(),
});

export const adminReportSchema = z.object({
  reportId: z.uuid(),
  status: z.enum(["open", "in_review", "resolved", "dismissed"]),
  note: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
});

export const adminDataRequestSchema = z.object({
  requestId: z.uuid(),
  status: z.enum(["pending", "processing", "completed", "rejected"]),
  note: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
});

export const contactStatusSchema = z.object({
  messageId: z.uuid(),
  status: z.enum(["new", "read", "archived"]),
});

export type FieldErrors = Record<string, string[]>;

export function collectFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_form";
    result[key] ??= [];
    result[key].push(issue.message);
  }
  return result;
}

export function firstError(errors: FieldErrors, key: string): string | undefined {
  return errors[key]?.[0];
}
