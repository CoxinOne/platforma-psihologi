export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export function actionSuccess<T = undefined>(data?: T): ActionResult<T> {
  return { ok: true, data: data as T };
}

export function actionFailure(
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return { ok: false, message, fieldErrors };
}

const MESSAGES: Array<[string, string]> = [
  ["SLOT_ALREADY_BOOKED", "Intervalul a fost rezervat între timp. Alege altă oră disponibilă."],
  ["23P01", "Intervalul a fost rezervat între timp. Alege altă oră disponibilă."],
  ["SLOT_NOT_AVAILABLE", "Intervalul nu mai este disponibil. Reîncarcă orele disponibile."],
  ["SLOT_IN_PAST", "Intervalul selectat este prea aproape de momentul actual."],
  ["SLOT_TOO_FAR", "Data selectată depășește perioada maximă de programare."],
  ["PSYCHOLOGIST_UNAVAILABLE", "Psihologul nu mai acceptă programări în acest moment."],
  ["MODE_UNAVAILABLE", "Tipul de consultație selectat nu este disponibil."],
  ["CABINET_INVALID", "Cabinetul selectat nu este disponibil pentru acest psiholog."],
  ["CABINET_NOT_OWNED", "Cabinetul selectat nu îți aparține."],
  ["CABINET_REQUIRED", "Selectează un cabinet pentru ședințele în persoană."],
  ["ONLY_CLIENTS_CAN_BOOK", "Doar conturile de client pot face programări."],
  ["ONLY_CLIENTS_CAN_START", "Doar conturile de client pot începe o conversație."],
  ["SELF_BOOKING_FORBIDDEN", "Nu îți poți face o programare proprie."],
  ["ACCOUNT_INACTIVE", "Contul tău este inactiv sau suspendat. Contactează administratorul."],
  ["NOT_AUTHENTICATED", "Sesiunea a expirat. Autentifică-te din nou."],
  ["RATE_LIMITED", "Ai trimis prea multe cereri într-un interval scurt. Încearcă mai târziu."],
  ["APPOINTMENT_NOT_FOUND", "Programarea nu a fost găsită."],
  ["APPOINTMENT_NOT_CHANGEABLE", "Programarea nu mai poate fi modificată în starea actuală."],
  ["APPOINTMENT_NOT_PENDING", "Programarea nu mai este în așteptare."],
  ["APPOINTMENT_NOT_CONFIRMED", "Programarea nu este confirmată."],
  ["APPOINTMENT_NOT_ENDED", "Ședința nu s-a încheiat încă."],
  ["APPOINTMENT_INVALID_TRANSITION", "Tranziția de status nu este permisă."],
  ["CANCELLATION_WINDOW_CLOSED", "Anularea nu mai este posibilă în mai puțin de 24 de ore înainte de ședință."],
  ["RESCHEDULE_WINDOW_CLOSED", "Reprogramarea nu mai este posibilă în mai puțin de 24 de ore înainte de ședință."],
  ["REASON_REQUIRED", "Motivul este obligatoriu pentru această acțiune."],
  ["REASON_TOO_LONG", "Motivul este prea lung."],
  ["MESSAGE_EMPTY", "Mesajul nu poate fi gol."],
  ["MESSAGE_TOO_LONG", "Mesajul poate avea cel mult 4000 de caractere."],
  ["MESSAGES_IMMUTABLE", "Mesajele nu pot fi modificate."],
  ["CONVERSATION_NOT_FOUND", "Conversația nu a fost găsită."],
  ["CONVERSATION_CLOSED", "Conversația este închisă."],
  ["NOT_ALLOWED", "Nu ai permisiunea necesară pentru această operațiune."],
  ["ROLE_CHANGE_FORBIDDEN", "Rolul contului nu poate fi modificat din aplicație."],
  ["STATUS_CHANGE_FORBIDDEN", "Statusul contului nu poate fi modificat din aplicație."],
  ["PROFILE_STATUS_FORBIDDEN", "Profilul profesional nu poate fi aprobat din contul propriu."],
  ["PROFILE_INCOMPLETE", "Profilul profesional este incomplet pentru aprobare."],
  ["PROFILE_INCOMPLETE_BIO", "Adaugă o prezentare de minimum 80 de caractere înainte de trimitere."],
  ["PROFILE_INCOMPLETE_EDUCATION", "Adaugă studiile și calificările înainte de trimitere."],
  ["PROFILE_INCOMPLETE_SPECIALTIES", "Selectează cel puțin o specializare înainte de trimitere."],
  ["PROFILE_INCOMPLETE_CABINET", "Adaugă un cabinet înainte de a trimite profilul pentru ședințe în persoană."],
  ["CANNOT_REPORT_SELF", "Nu îți poți raporta propriul cont."],
  ["INVALID_CATEGORY", "Categoria raportării nu este validă."],
  ["NO_RELATION_TO_REPORT", "Poți raporta doar un utilizator cu care ai o conversație sau o programare."],
  ["INVALID_CONVERSATION", "Conversația selectată nu este validă."],
  ["CANNOT_CHANGE_OWN_ROLE", "Nu îți poți modifica propriul rol."],
  ["CANNOT_SUSPEND_SELF", "Nu îți poți suspenda propriul cont."],
  ["LAST_ADMIN", "Nu poți elimina ultimul administrator activ."],
  ["INVALID_STATUS", "Statusul selectat nu este valid."],
  ["PROFILE_NOT_FOUND", "Profilul profesional nu a fost găsit."],
  ["USER_NOT_FOUND", "Contul nu a fost găsit."],
  ["ALREADY_PSYCHOLOGIST", "Contul are deja rol de psiholog."],
  ["INVALID_ROLE", "Rolul selectat nu este valid."],
  ["PERMISSION_DENIED", "Nu ai permisiunea necesară pentru această operațiune."],
  ["42501", "Nu ai permisiunea necesară pentru această operațiune."],
  ["INVALID_FULL_NAME", "Numele complet nu este valid."],
  ["INVALID_PHONE", "Numărul de telefon nu este valid."],
];

export function humanizeError(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error ?? "");

  for (const [code, message] of MESSAGES) {
    if (raw.includes(code)) return message;
  }

  if (raw.toLowerCase().includes("invalid login credentials")) {
    return "Adresa de e-mail sau parola nu sunt corecte.";
  }
  if (raw.toLowerCase().includes("email not confirmed")) {
    return "Adresa de e-mail nu este confirmată. Verifică mesajul primit.";
  }
  if (raw.toLowerCase().includes("user already registered")) {
    return "Există deja un cont cu această adresă de e-mail.";
  }
  if (raw.toLowerCase().includes("password should be at least")) {
    return "Parola nu respectă cerințele minime de securitate.";
  }
  if (raw.toLowerCase().includes("rate limit")) {
    return "Prea multe încercări. Așteaptă câteva minute și încearcă din nou.";
  }
  if (raw.toLowerCase().includes("fetch failed") || raw.toLowerCase().includes("network")) {
    return "Serviciul nu este disponibil momentan. Verifică conexiunea și încearcă din nou.";
  }

  return "A apărut o eroare neașteptată. Operațiunea nu a fost finalizată.";
}

export function logServerError(context: string, error: unknown): void {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : undefined;
  const message = error instanceof Error ? error.message : String(error);
  // Nu jurnalizăm conținutul mesajelor private sau date de contact.
  console.error(`[${context}]`, code ?? "unknown", message.slice(0, 300));
}
