import { describe, expect, it } from "vitest";
import {
  addDays,
  formatDateTime,
  generateLocalSlots,
  isValidDateInput,
  localDateKey,
  zonedDateTimeToUtc,
} from "@/lib/time";
import { isSafeRedirect, roleHome, safeNext } from "@/lib/permissions";
import { humanizeError } from "@/lib/errors";
import { collectFieldErrors, profileSchema, signupSchema } from "@/lib/validation";

describe("fus orar și schimbarea orei", () => {
  it("convertește ora locală în UTC înainte și după trecerea la ora de vară", () => {
    expect(zonedDateTimeToUtc("2027-03-27", "09:00").toISOString()).toBe(
      "2027-03-27T07:00:00.000Z",
    );
    expect(zonedDateTimeToUtc("2027-03-28", "09:00").toISOString()).toBe(
      "2027-03-28T06:00:00.000Z",
    );
  });

  it("convertește corect la trecerea la ora de iarnă", () => {
    expect(zonedDateTimeToUtc("2027-10-30", "09:00").toISOString()).toBe(
      "2027-10-30T06:00:00.000Z",
    );
    expect(zonedDateTimeToUtc("2027-10-31", "09:00").toISOString()).toBe(
      "2027-10-31T07:00:00.000Z",
    );
  });

  it("nu generează intervale duplicate în ziua în care ora 03:00 nu există", () => {
    const slots = generateLocalSlots({
      date: "2027-03-28",
      startTime: "02:00",
      endTime: "06:00",
      durationMinutes: 50,
      stepMinutes: 30,
    });
    const unique = new Set(slots.map((slot) => slot.getTime()));
    expect(unique.size).toBe(slots.length);
    expect(slots.length).toBeGreaterThan(0);
    for (let index = 1; index < slots.length; index += 1) {
      expect(slots[index]!.getTime()).toBeGreaterThan(slots[index - 1]!.getTime());
    }
  });

  it("generează orele la pasul configurat", () => {
    const slots = generateLocalSlots({
      date: "2027-02-01",
      startTime: "09:00",
      endTime: "12:00",
      durationMinutes: 50,
      stepMinutes: 30,
    });
    expect(slots.map((slot) => slot.toISOString())).toEqual([
      "2027-02-01T07:00:00.000Z",
      "2027-02-01T07:30:00.000Z",
      "2027-02-01T08:00:00.000Z",
      "2027-02-01T08:30:00.000Z",
      "2027-02-01T09:00:00.000Z",
    ]);
  });

  it("formatează data în limba română", () => {
    expect(formatDateTime("2027-02-01T07:00:00Z")).toContain("1 februarie 2027");
    expect(localDateKey("2027-02-01T23:30:00Z")).toBe("2027-02-02");
  });

  it("adaugă zile peste granița de lună și an", () => {
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
    expect(addDays("2027-12-31", 1)).toBe("2028-01-01");
    expect(isValidDateInput("2027-02-29")).toBe(false);
  });
});

describe("permisiuni și redirectări", () => {
  it("acceptă doar căi interne sigure", () => {
    expect(isSafeRedirect("/dashboard/mesaje")).toBe(true);
    expect(isSafeRedirect("//evil.example")).toBe(false);
    expect(isSafeRedirect("https://evil.example")).toBe(false);
    expect(isSafeRedirect("/\\evil")).toBe(false);
    expect(safeNext("//evil.example", "/dashboard")).toBe("/dashboard");
    expect(safeNext("/cabinet", "/dashboard")).toBe("/cabinet");
  });

  it("trimite fiecare rol către zona potrivită", () => {
    expect(roleHome("admin")).toBe("/admin");
    expect(roleHome("psychologist")).toBe("/cabinet");
    expect(roleHome("client")).toBe("/dashboard");
  });
});

describe("validarea datelor", () => {
  const validSignup = {
    fullName: "Ana Popescu",
    email: "ANA@Exemplu.RO",
    password: "Parola12345",
    confirmPassword: "Parola12345",
    accountType: "client",
    terms: true,
    ageConfirm: true,
  };

  it("acceptă o înregistrare validă și normalizează e-mailul", () => {
    const result = signupSchema.safeParse(validSignup);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ana@exemplu.ro");
    }
  });

  it("respinge parolele slabe și confirmarea diferită", () => {
    const weak = signupSchema.safeParse({ ...validSignup, password: "abc", confirmPassword: "abc" });
    expect(weak.success).toBe(false);

    const mismatch = signupSchema.safeParse({
      ...validSignup,
      confirmPassword: "AltaParola123",
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      const errors = collectFieldErrors(mismatch.error);
      expect(errors.confirmPassword?.[0]).toContain("nu coincid");
    }
  });

  it("respinge acceptarea lipsă a termenilor", () => {
    const result = signupSchema.safeParse({ ...validSignup, terms: false });
    expect(result.success).toBe(false);
  });

  it("validează profilul și telefonul opțional", () => {
    expect(profileSchema.safeParse({ fullName: "Ana", phone: "", marketingConsent: false }).success).toBe(
      true,
    );
    expect(
      profileSchema.safeParse({ fullName: "Ana", phone: "abc", marketingConsent: false }).success,
    ).toBe(false);
  });
});

describe("mesaje de eroare pentru utilizator", () => {
  it("traduce erorile cunoscute fără a expune detalii tehnice", () => {
    expect(humanizeError({ message: "SLOT_ALREADY_BOOKED" })).toContain("rezervat între timp");
    expect(humanizeError({ message: "RATE_LIMITED" })).toContain("prea multe cereri");
    expect(humanizeError(new Error("invalid login credentials"))).toContain("parola");
    expect(humanizeError(new Error("ceva necunoscut"))).toBe(
      "A apărut o eroare neașteptată. Operațiunea nu a fost finalizată.",
    );
  });
});
