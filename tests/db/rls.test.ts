/**
 * Teste de integritate pe PostgreSQL real:
 *   - RLS și izolarea datelor între roluri
 *   - programări, conflicte de suprapunere, fus orar
 *   - mesagerie privată și notificări
 *   - fluxuri administrative auditate
 *
 * Rulare: npm run db:setup && npm run test:db
 * Necesită TEST_DATABASE_URL (containerul Docker sau un PostgreSQL local).
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Client } from "pg";

const connectionString = process.env.TEST_DATABASE_URL;
const describeDb = connectionString ? describe : describe.skip;

const IDS = {
  admin: "11111111-1111-4111-8111-111111111111",
  psychA: "22222222-2222-4222-8222-222222222222",
  psychB: "33333333-3333-4333-8333-333333333333",
  clientA: "44444444-4444-4444-8444-444444444444",
  clientB: "55555555-5555-4555-8555-555555555555",
  suspended: "66666666-6666-4666-8666-666666666666",
  psychC: "77777777-7777-4777-8777-777777777777",
} as const;

const CABINET_ID = "88888888-8888-4888-8888-888888888888";
const SPECIALTY_SLUG = "psihologie-clinica";

let admin: Client;

type Queryable = Pick<Client, "query">;

async function asUser<T>(
  userId: string | null,
  fn: (db: Queryable) => Promise<T>,
  options: { role?: "authenticated" | "anon"; commit?: boolean } = {},
): Promise<T> {
  const db = new Client({ connectionString });
  await db.connect();
  const role = options.role ?? (userId ? "authenticated" : "anon");
  try {
    await db.query("begin");
    await db.query(`set local role ${role}`);
    await db.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify(userId ? { sub: userId, role } : { role: "anon" }),
    ]);
    const result = await fn(db);
    if (options.commit) {
      await db.query("commit");
    } else {
      await db.query("rollback");
    }
    return result;
  } catch (error) {
    await db.query("rollback").catch(() => {});
    throw error;
  } finally {
    await db.end();
  }
}

async function expectDbError(promise: Promise<unknown>, pattern: string | RegExp) {
  await expect(promise).rejects.toThrow(pattern);
}

async function cleanupData() {
  await admin.query("delete from public.appointments");
  await admin.query("delete from public.conversations");
  await admin.query("delete from public.notifications");
  await admin.query("delete from public.abuse_reports");
  await admin.query("delete from public.data_requests");
  await admin.query("delete from public.rate_limit_events");
  await admin.query("delete from public.audit_logs");
}

async function insertAppointment(options: {
  clientId: string;
  psychologistId?: string;
  startsAt: string;
  status?: string;
  mode?: string;
  cabinetId?: string | null;
}) {
  const { rows } = await admin.query(
    `insert into public.appointments
       (client_id, psychologist_id, cabinet_id, starts_at, ends_at, duration_minutes, mode, status, timezone)
     values ($1, $2, $3, $4::timestamptz, $4::timestamptz + interval '50 minutes', 50, $5, $6, 'Europe/Bucharest')
     returning id`,
    [
      options.clientId,
      options.psychologistId ?? IDS.psychA,
      options.cabinetId ?? null,
      options.startsAt,
      options.mode ?? "online",
      options.status ?? "confirmed",
    ],
  );
  return rows[0].id as string;
}

describeDb("Securitate și izolare (PostgreSQL + RLS)", () => {
  beforeAll(async () => {
    admin = new Client({ connectionString });
    await admin.connect();
    await cleanupData();

    await admin.query("delete from public.psychologist_profiles");
    await admin.query("delete from public.psychologist_cabinets");
    await admin.query("delete from public.availability_exceptions");
    await admin.query("delete from public.availability_rules");
    await admin.query("delete from public.cabinets");
    await admin.query("delete from auth.users");

    for (const [key, id] of Object.entries(IDS)) {
      await admin.query(
        "insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3::jsonb)",
        [id, `${key.toLowerCase()}@test.local`, JSON.stringify({ full_name: `Utilizator ${key}` })],
      );
    }

    await admin.query("alter table public.profiles disable trigger profiles_guard_update");
    await admin.query("alter table public.psychologist_profiles disable trigger psychologist_profiles_guard_update");
    await admin.query("alter table public.availability_rules disable trigger availability_rules_guard");
    await admin.query("alter table public.availability_exceptions disable trigger availability_exceptions_guard");

    await admin.query("update public.profiles set role = 'admin' where id = $1", [IDS.admin]);
    await admin.query("update public.profiles set role = 'psychologist' where id = any($1::uuid[])", [
      [IDS.psychA, IDS.psychB, IDS.psychC],
    ]);
    await admin.query("update public.profiles set status = 'suspended' where id = $1", [IDS.suspended]);

    await admin.query(
      "insert into public.psychologist_profiles (user_id, slug, display_name, professional_title, bio, education, experience, languages, consultation_modes, session_duration_minutes, price_ron, status, verified_at, verified_by, published_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 50, 250, 'approved', now(), $10, now())",
      [
        IDS.psychA,
        "ana-demo",
        "Ana Demo",
        "Psiholog clinician",
        "Profil demonstrativ pentru teste. Prezentare suficient de lungă pentru a îndeplini cerințele de validare ale platformei.",
        "Studii universitare de psihologie, program de masterat și formare profesională continuă.",
        "Experiență profesională demonstrativă în cadrul testelor automate.",
        ["română", "engleză"],
        ["online", "in_person"],
        IDS.admin,
      ],
    );
    await admin.query(
      "insert into public.psychologist_profiles (user_id, slug, display_name, professional_title, bio, education, languages, consultation_modes, session_duration_minutes, status, verified_at, verified_by, published_at) values ($1, $2, $3, $4, $5, $6, $7, $8, 50, 'approved', now(), $9, now())",
      [
        IDS.psychB,
        "bogdan-demo",
        "Bogdan Demo",
        "Psihoterapeut",
        "Profil demonstrativ pentru teste. Prezentare suficient de lungă pentru a îndeplini cerințele de validare ale platformei.",
        "Formare profesională demonstrativă în psihoterapie.",
        ["română"],
        ["online"],
        IDS.admin,
      ],
    );
    await admin.query(
      "insert into public.psychologist_profiles (user_id, slug, display_name, professional_title, bio, education, languages, consultation_modes, session_duration_minutes, status) values ($1, $2, $3, $4, $5, $6, $7, $8, 50, 'draft')",
      [
        IDS.psychC,
        "cristina-demo",
        "Cristina Demo",
        "Psiholog",
        "Profil demonstrativ în curs de completare. Prezentare suficient de lungă pentru a îndeplini cerințele minime.",
        "Studii demonstrative de psihologie și formare continuă.",
        ["română"],
        ["online"],
      ],
    );

    await admin.query(
      "insert into public.cabinets (id, slug, name, address_line, city, county, postal_code, phone, description, is_demo) values ($1, 'cabinet-demo', 'Cabinet Demo', 'Strada Exemplu nr. 1', 'București', 'București', '010101', '0212345678', 'Date demonstrative pentru teste.', true)",
      [CABINET_ID],
    );
    await admin.query(
      "insert into public.psychologist_cabinets (psychologist_id, cabinet_id, is_primary) values ($1, $2, true)",
      [IDS.psychA, CABINET_ID],
    );
    await admin.query(
      "insert into public.psychologist_specialties (psychologist_id, specialty_id) select $1, id from public.specialties where slug = $2",
      [IDS.psychA, SPECIALTY_SLUG],
    );
    await admin.query(
      "insert into public.psychologist_specialties (psychologist_id, specialty_id) select $1, id from public.specialties where slug = $2",
      [IDS.psychB, SPECIALTY_SLUG],
    );

    for (const psychologistId of [IDS.psychA, IDS.psychB]) {
      await admin.query(
        "insert into public.availability_rules (psychologist_id, weekday, start_time, end_time, slot_step_minutes, mode) values ($1, 1, '09:00', '13:00', 30, 'online')",
        [psychologistId],
      );
    }
    await admin.query(
      "insert into public.availability_rules (psychologist_id, weekday, start_time, end_time, slot_step_minutes, mode, cabinet_id) values ($1, 1, '14:00', '16:00', 30, 'in_person', $2)",
      [IDS.psychA, CABINET_ID],
    );

    for (const date of ["2027-03-27", "2027-03-28", "2027-10-30", "2027-10-31"]) {
      await admin.query(
        "insert into public.availability_exceptions (psychologist_id, exception_date, is_closed, start_time, end_time, slot_step_minutes) values ($1, $2, false, '09:00', '12:00', 30)",
        [IDS.psychA, date],
      );
    }

    await admin.query("alter table public.profiles enable trigger profiles_guard_update");
    await admin.query("alter table public.psychologist_profiles enable trigger psychologist_profiles_guard_update");
    await admin.query("alter table public.availability_rules enable trigger availability_rules_guard");
    await admin.query("alter table public.availability_exceptions enable trigger availability_exceptions_guard");
  }, 60_000);

  beforeEach(async () => {
    await cleanupData();
  });

  afterAll(async () => {
    await admin?.end();
  });

  it("anon nu poate citi tabelele private", async () => {
    await expectDbError(
      asUser(null, (db) => db.query("select * from public.profiles limit 1")),
      /permission denied/i,
    );
    await expectDbError(
      asUser(null, (db) => db.query("select * from public.messages limit 1")),
      /permission denied/i,
    );
  });

  it("view-ul public expune doar profile aprobate și nu conține coloane private", async () => {
    const result = await asUser(null, (db) =>
      db.query(
        "select user_id, display_name, is_verified, specialty_slugs from public.public_psychologists order by display_name",
      ),
    );
    expect(result.rows).toHaveLength(2);
    expect(result.rows.map((row) => row.display_name)).toEqual(["Ana Demo", "Bogdan Demo"]);
    expect(result.rows[0].is_verified).toBe(true);
    expect(result.rows[0].specialty_slugs).toContain(SPECIALTY_SLUG);

    await expectDbError(
      asUser(null, (db) => db.query("select email from public.public_psychologists limit 1")),
      /column .* does not exist/i,
    );
  });

  it("un client vede doar propriile programări", async () => {
    await insertAppointment({ clientId: IDS.clientA, startsAt: "2027-02-08T07:00:00Z" });
    await insertAppointment({ clientId: IDS.clientB, startsAt: "2027-02-08T09:00:00Z" });

    const own = await asUser(IDS.clientA, (db) =>
      db.query("select client_id from public.appointments"),
    );
    expect(own.rows).toHaveLength(1);
    expect(own.rows[0].client_id).toBe(IDS.clientA);

    const psychologist = await asUser(IDS.psychA, (db) =>
      db.query("select client_id from public.appointments order by client_id"),
    );
    expect(psychologist.rows).toHaveLength(2);

    const unrelated = await asUser(IDS.suspended, (db) =>
      db.query("select * from public.appointments"),
    );
    expect(unrelated.rows).toHaveLength(0);
  });

  it("un utilizator nu poate modifica profilul altcuiva sau propriul rol", async () => {
    await expectDbError(
      asUser(IDS.clientA, (db) =>
        db.query("update public.profiles set full_name = 'Atac' where id = $1", [IDS.clientB]),
      ),
      /permission denied/i,
    );

    const { rows } = await admin.query("select full_name from public.profiles where id = $1", [
      IDS.clientB,
    ]);
    expect(rows[0].full_name).not.toBe("Atac");

    await expectDbError(
      asUser(IDS.clientA, (db) =>
        db.query("update public.profiles set role = 'admin' where id = $1", [IDS.clientA]),
      ),
      /permission denied/i,
    );
  });

  it("un client nu poate scrie direct programări", async () => {
    await expectDbError(
      asUser(IDS.clientA, (db) =>
        db.query(
          "insert into public.appointments (client_id, psychologist_id, starts_at, ends_at, duration_minutes, mode) values ($1, $2, now() + interval '10 days', now() + interval '10 days 50 minutes', 50, 'online')",
          [IDS.clientA, IDS.psychA],
        ),
      ),
      /permission denied/i,
    );
  });

  it("rezervarea creează o programare în așteptare și notifică psihologul", async () => {
    const appointmentId = await asUser(
      IDS.clientA,
      async (db) => {
        const { rows } = await db.query(
          "select public.book_appointment($1, '2027-02-01T07:00:00Z'::timestamptz, 'online', null, 'Notă de test') as id",
          [IDS.psychA],
        );
        return rows[0].id as string;
      },
      { commit: true },
    );

    const { rows } = await admin.query(
      "select status, starts_at, ends_at, duration_minutes, price_ron from public.appointments where id = $1",
      [appointmentId],
    );
    expect(rows[0].status).toBe("pending");
    expect(rows[0].duration_minutes).toBe(50);
    expect(new Date(rows[0].starts_at).toISOString()).toBe("2027-02-01T07:00:00.000Z");
    expect(rows[0].price_ron).toBe("250.00");

    const notifications = await admin.query(
      "select type, user_id from public.notifications where user_id = $1",
      [IDS.psychA],
    );
    expect(notifications.rows).toHaveLength(1);
    expect(notifications.rows[0].type).toBe("appointment_requested");

    const slots = await asUser(null, (db) =>
      db.query("select starts_at from public.available_slots($1, '2027-02-01'::date, 'online')", [
        IDS.psychA,
      ]),
    );
    const utcSlots = slots.rows.map((row) => new Date(row.starts_at).toISOString());
    expect(utcSlots).not.toContain("2027-02-01T07:00:00.000Z");
    expect(utcSlots).not.toContain("2027-02-01T07:30:00.000Z");
  });

  it("a doua rezervare pe același interval este respinsă", async () => {
    await asUser(
      IDS.clientA,
      (db) =>
        db.query(
          "select public.book_appointment($1, '2027-02-01T08:00:00Z'::timestamptz, 'online', null, null)",
          [IDS.psychA],
        ),
      { commit: true },
    );

    await expectDbError(
      asUser(
        IDS.clientB,
        (db) =>
          db.query(
            "select public.book_appointment($1, '2027-02-01T08:00:00Z'::timestamptz, 'online', null, null)",
            [IDS.psychA],
          ),
        { commit: true },
      ),
      /SLOT_ALREADY_BOOKED|SLOT_NOT_AVAILABLE/,
    );

    const { rows } = await admin.query(
      "select count(*)::int as count from public.appointments where psychologist_id = $1",
      [IDS.psychA],
    );
    expect(rows[0].count).toBe(1);
  });

  it("două rezervări simultane pentru același interval: exact una reușește", async () => {
    const c1 = new Client({ connectionString });
    const c2 = new Client({ connectionString });
    await c1.connect();
    await c2.connect();

    const begin = async (client: Client, userId: string) => {
      await client.query("begin");
      await client.query("set local role authenticated");
      await client.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: userId, role: "authenticated" }),
      ]);
    };

    await begin(c1, IDS.clientA);
    await begin(c2, IDS.clientB);

    const attempt1 = c1
      .query(
        "select public.book_appointment($1, '2027-02-01T09:00:00Z'::timestamptz, 'online', null, null)",
        [IDS.psychA],
      )
      .then(() => true)
      .catch(() => false);

    await new Promise((resolve) => setTimeout(resolve, 150));

    const attempt2 = c2
      .query(
        "select public.book_appointment($1, '2027-02-01T09:00:00Z'::timestamptz, 'online', null, null)",
        [IDS.psychA],
      )
      .then(() => true)
      .catch(() => false);

    const result1 = await attempt1;
    if (result1) {
      await c1.query("commit");
    } else {
      await c1.query("rollback").catch(() => {});
    }

    const result2 = await attempt2;
    if (result2) {
      await c2.query("commit");
    } else {
      await c2.query("rollback").catch(() => {});
    }

    await c1.end();
    await c2.end();

    expect([result1, result2].filter(Boolean)).toHaveLength(1);

    const { rows } = await admin.query(
      "select count(*)::int as count from public.appointments where psychologist_id = $1",
      [IDS.psychA],
    );
    expect(rows[0].count).toBe(1);
  });

  it("respectă fereastra de anulare de 24 de ore", async () => {
    const startsAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const appointmentId = await insertAppointment({
      clientId: IDS.clientA,
      startsAt,
      status: "confirmed",
    });

    await expectDbError(
      asUser(
        IDS.clientA,
        (db) => db.query("select public.cancel_appointment($1, 'motiv')", [appointmentId]),
        { commit: true },
      ),
      /CANCELLATION_WINDOW_CLOSED/,
    );

    await asUser(
      IDS.psychA,
      (db) =>
        db.query("select public.cancel_appointment($1, 'Impediment profesional')", [
          appointmentId,
        ]),
      { commit: true },
    );

    const { rows } = await admin.query(
      "select status, cancelled_by, cancellation_reason from public.appointments where id = $1",
      [appointmentId],
    );
    expect(rows[0].status).toBe("cancelled");
    expect(rows[0].cancelled_by).toBe(IDS.psychA);
    expect(rows[0].cancellation_reason).toContain("Impediment");
  });

  it("psihologul confirmă doar propriile cereri, iar clientul este notificat", async () => {
    const appointmentId = await insertAppointment({
      clientId: IDS.clientA,
      startsAt: "2027-02-08T07:00:00Z",
      status: "pending",
    });

    await expectDbError(
      asUser(IDS.psychB, (db) =>
        db.query("select public.confirm_appointment($1)", [appointmentId]),
      ),
      /NOT_ALLOWED/,
    );

    await asUser(
      IDS.psychA,
      (db) => db.query("select public.confirm_appointment($1)", [appointmentId]),
      { commit: true },
    );

    const { rows } = await admin.query(
      "select status, confirmed_at from public.appointments where id = $1",
      [appointmentId],
    );
    expect(rows[0].status).toBe("confirmed");
    expect(rows[0].confirmed_at).not.toBeNull();

    const notifications = await admin.query(
      "select type from public.notifications where user_id = $1",
      [IDS.clientA],
    );
    expect(notifications.rows.map((row) => row.type)).toContain("appointment_confirmed");
  });

  it("contul suspendat nu poate rezerva", async () => {
    await expectDbError(
      asUser(
        IDS.suspended,
        (db) =>
          db.query(
            "select public.book_appointment($1, '2027-02-01T10:00:00Z'::timestamptz, 'online', null, null)",
            [IDS.psychA],
          ),
        { commit: true },
      ),
      /ACCOUNT_INACTIVE/,
    );
  });

  it("conversațiile și mesajele sunt vizibile doar participanților", async () => {
    const conversationId = await asUser(
      IDS.clientA,
      async (db) => {
        const { rows } = await db.query(
          "select public.start_conversation($1, 'Mesaj privat de test') as id",
          [IDS.psychA],
        );
        return rows[0].id as string;
      },
      { commit: true },
    );

    const asA = await asUser(IDS.clientA, (db) =>
      db.query("select body from public.messages where conversation_id = $1", [conversationId]),
    );
    expect(asA.rows).toHaveLength(1);

    const asPsychA = await asUser(IDS.psychA, (db) =>
      db.query("select body from public.messages where conversation_id = $1", [conversationId]),
    );
    expect(asPsychA.rows).toHaveLength(1);

    for (const outsider of [IDS.clientB, IDS.psychB, IDS.admin]) {
      const result = await asUser(outsider, (db) =>
        db.query("select body from public.messages where conversation_id = $1", [conversationId]),
      );
      expect(result.rows, `utilizatorul ${outsider} nu trebuie să vadă mesajele`).toHaveLength(0);
    }

    const conversations = await asUser(IDS.clientB, (db) =>
      db.query("select id from public.conversations"),
    );
    expect(conversations.rows).toHaveLength(0);
  });

  it("mesajele sunt imutabile pentru utilizatori", async () => {
    const conversationId = await asUser(
      IDS.clientA,
      async (db) => {
        const { rows } = await db.query(
          "select public.start_conversation($1, 'Mesaj imutabil') as id",
          [IDS.psychA],
        );
        return rows[0].id as string;
      },
      { commit: true },
    );

    await expectDbError(
      asUser(IDS.clientA, (db) =>
        db.query("update public.messages set body = 'modificat' where conversation_id = $1", [
          conversationId,
        ]),
      ),
      /permission denied/i,
    );
  });

  it("notificările sunt izolate pe utilizator", async () => {
    await asUser(
      IDS.clientA,
      (db) =>
        db.query("select public.start_conversation($1, 'Mesaj pentru notificare')", [IDS.psychA]),
      { commit: true },
    );

    const psychNotifications = await asUser(IDS.psychA, (db) =>
      db.query("select type from public.notifications"),
    );
    expect(psychNotifications.rows.map((row) => row.type)).toContain("message_new");

    const otherNotifications = await asUser(IDS.clientB, (db) =>
      db.query("select * from public.notifications"),
    );
    expect(otherNotifications.rows).toHaveLength(0);
  });

  it("profilul privat nu este vizibil unui utilizator fără legătură", async () => {
    const unrelated = await asUser(IDS.clientB, (db) =>
      db.query("select full_name from public.profiles where id = $1", [IDS.clientA]),
    );
    expect(unrelated.rows).toHaveLength(0);

    await asUser(
      IDS.clientA,
      (db) => db.query("select public.start_conversation($1, null)", [IDS.psychA]),
      { commit: true },
    );

    const related = await asUser(IDS.psychA, (db) =>
      db.query("select full_name from public.profiles where id = $1", [IDS.clientA]),
    );
    expect(related.rows).toHaveLength(1);
  });

  it("psihologul nu se poate auto-aproba, iar administratorul poate aproba cu audit", async () => {
    await asUser(
      IDS.psychC,
      (db) =>
        db.query(
          "insert into public.psychologist_specialties (psychologist_id, specialty_id) select $1, id from public.specialties where slug = $2",
          [IDS.psychC, SPECIALTY_SLUG],
        ),
      { commit: true },
    );

    await asUser(
      IDS.psychC,
      (db) =>
        db.query(
          "update public.psychologist_profiles set bio = $1, education = $2, status = 'pending' where user_id = $3",
          [
            "Prezentare completă pentru trimiterea spre verificare. Text suficient de lung pentru validarea automată a profilului.",
            "Studii și calificări demonstrative, verificate înainte de publicare.",
            IDS.psychC,
          ],
        ),
      { commit: true },
    );

    await expectDbError(
      asUser(
        IDS.psychC,
        (db) =>
          db.query("update public.psychologist_profiles set status = 'approved' where user_id = $1", [
            IDS.psychC,
          ]),
        { commit: true },
      ),
      /PROFILE_STATUS_FORBIDDEN/,
    );

    await asUser(
      IDS.admin,
      (db) =>
        db.query("select public.admin_set_professional_status($1, 'approved', null)", [IDS.psychC]),
      { commit: true },
    );

    const { rows } = await admin.query(
      "select status, verified_at, published_at from public.psychologist_profiles where user_id = $1",
      [IDS.psychC],
    );
    expect(rows[0].status).toBe("approved");
    expect(rows[0].verified_at).not.toBeNull();
    expect(rows[0].published_at).not.toBeNull();

    const audit = await admin.query(
      "select action from public.audit_logs where entity_id = $1 order by created_at desc limit 1",
      [IDS.psychC],
    );
    expect(audit.rows[0].action).toBe("admin.professional.status_changed");

    const publicView = await asUser(null, (db) =>
      db.query("select display_name from public.public_psychologists where user_id = $1", [
        IDS.psychC,
      ]),
    );
    expect(publicView.rows).toHaveLength(1);
  });

  it("administratorul nu își poate schimba propriul rol", async () => {
    await expectDbError(
      asUser(
        IDS.admin,
        (db) => db.query("select public.admin_set_user_role($1, 'client')", [IDS.admin]),
        { commit: true },
      ),
      /CANNOT_CHANGE_OWN_ROLE/,
    );
  });

  it("înregistrarea publică ignoră requested_role și creează doar client", async () => {
    const signupId = "99999999-9999-4999-8999-999999999999";
    await admin.query(
      "insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3::jsonb)",
      [
        signupId,
        "signup-psychologist-request@test.local",
        JSON.stringify({
          full_name: "Cerere Psiholog",
          requested_role: "psychologist",
          terms_accepted_at: new Date().toISOString(),
        }),
      ],
    );

    const { rows } = await admin.query(
      "select role, requested_role from public.profiles where id = $1",
      [signupId],
    );
    expect(rows[0]?.role).toBe("client");
    expect(rows[0]?.requested_role).toBeNull();

    await admin.query("delete from auth.users where id = $1", [signupId]);
  });

  it("cererile publice de cont profesional sunt dezactivate", async () => {
    await expectDbError(
      asUser(IDS.clientA, (db) => db.query("select public.request_psychologist_account()")),
      /PSYCHOLOGIST_SIGNUP_DISABLED/,
    );
  });

  it("a 13-a promovare ca psiholog este respinsă", async () => {
    await admin.query("begin");
    await admin.query("alter table public.profiles disable trigger profiles_guard_update");
    try {
      const extraIds = Array.from(
        { length: 9 },
        (_, index) => `a0000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      );
      for (const [index, id] of extraIds.entries()) {
        await admin.query(
          "insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3::jsonb)",
          [id, `limit-${index}@test.local`, JSON.stringify({ full_name: `Limit ${index}` })],
        );
      }
      await admin.query(
        "update public.profiles set role = 'psychologist' where id = any($1::uuid[])",
        [extraIds],
      );

      await expectDbError(
        admin.query("update public.profiles set role = 'psychologist' where id = $1", [IDS.clientA]),
        /PSYCHOLOGIST_LIMIT_REACHED/,
      );
    } finally {
      await admin.query("rollback");
      await admin.query("alter table public.profiles enable trigger profiles_guard_update");
    }
  });

  it("fusul orar este corect la trecerea la ora de vară și de iarnă", async () => {
    const cases = [
      { date: "2027-03-27", expected: "2027-03-27 07:00" },
      { date: "2027-03-28", expected: "2027-03-28 06:00" },
      { date: "2027-10-30", expected: "2027-10-30 06:00" },
      { date: "2027-10-31", expected: "2027-10-31 07:00" },
    ];

    for (const testCase of cases) {
      const result = await asUser(null, (db) =>
        db.query(
          `select to_char(starts_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as utc
             from public.available_slots($1, $2::date, 'online')
            order by starts_at limit 1`,
          [IDS.psychA, testCase.date],
        ),
      );
      expect(result.rows[0]?.utc, `data ${testCase.date}`).toBe(testCase.expected);
    }
  });

  it("ședințele în cabinet necesită un cabinet valid", async () => {
    await expectDbError(
      asUser(
        IDS.clientA,
        (db) =>
          db.query(
            "select public.book_appointment($1, '2027-02-01T12:00:00Z'::timestamptz, 'in_person', null, null)",
            [IDS.psychA],
          ),
        { commit: true },
      ),
      /CABINET_INVALID/,
    );

    const appointmentId = await asUser(
      IDS.clientA,
      async (db) => {
        const { rows } = await db.query(
          "select public.book_appointment($1, '2027-02-01T12:00:00Z'::timestamptz, 'in_person', $2, null) as id",
          [IDS.psychA, CABINET_ID],
        );
        return rows[0].id as string;
      },
      { commit: true },
    );

    const { rows } = await admin.query(
      "select mode, cabinet_id from public.appointments where id = $1",
      [appointmentId],
    );
    expect(rows[0].mode).toBe("in_person");
    expect(rows[0].cabinet_id).toBe(CABINET_ID);
  });

  it("raportarea de abuz necesită o relație existentă", async () => {
    await expectDbError(
      asUser(
        IDS.clientB,
        (db) =>
          db.query("select public.report_abuse($1, null, 'spam', 'Test')", [IDS.psychA]),
        { commit: true },
      ),
      /NO_RELATION_TO_REPORT/,
    );

    const conversationId = await asUser(
      IDS.clientA,
      async (db) => {
        const { rows } = await db.query("select public.start_conversation($1, null) as id", [
          IDS.psychA,
        ]);
        return rows[0].id as string;
      },
      { commit: true },
    );

    const reportId = await asUser(
      IDS.clientA,
      async (db) => {
        const { rows } = await db.query(
          "select public.report_abuse($1, $2, 'spam', 'Detalii demonstrative') as id",
          [IDS.psychA, conversationId],
        );
        return rows[0].id as string;
      },
      { commit: true },
    );

    const found = await admin.query(
      "select count(*)::int as count from public.abuse_reports where id = $1",
      [reportId],
    );
    expect(found.rows[0].count).toBe(1);

    const visible = await asUser(IDS.admin, (db) =>
      db.query("select id from public.abuse_reports where id = $1", [reportId]),
    );
    expect(visible.rows).toHaveLength(1);
  });

  it("solicitarea de export GDPR este înregistrată și auditată", async () => {
    const requestId = await asUser(
      IDS.clientA,
      async (db) => {
        const { rows } = await db.query("select public.request_data_export() as id");
        return rows[0].id as string;
      },
      { commit: true },
    );

    const { rows } = await admin.query(
      "select type, status, user_id from public.data_requests where id = $1",
      [requestId],
    );
    expect(rows[0].type).toBe("export");
    expect(rows[0].status).toBe("pending");
    expect(rows[0].user_id).toBe(IDS.clientA);

    const audit = await admin.query(
      "select action from public.audit_logs where entity_id = $1",
      [requestId],
    );
    expect(audit.rows[0].action).toBe("data.export_requested");
  });

  it("funcțiile interne de rate limiting nu sunt expuse rolurilor de aplicație", async () => {
    await expectDbError(
      asUser(IDS.clientA, (db) =>
        db.query("select public.check_rate_limit('test', 1, 60)"),
      ),
      /permission denied/i,
    );
  });

  it("suspendarea și reactivarea sunt auditate, iar profilul public dispare", async () => {
    await asUser(
      IDS.admin,
      (db) =>
        db.query(
          "select public.admin_set_account_status($1, 'suspended', 'Încălcare demonstrativă a termenilor platformei')",
          [IDS.psychB],
        ),
      { commit: true },
    );

    const suspended = await asUser(null, (db) =>
      db.query("select count(*)::int as count from public.public_psychologists where user_id = $1", [
        IDS.psychB,
      ]),
    );
    expect(suspended.rows[0].count).toBe(0);

    const audit = await admin.query(
      "select action from public.audit_logs where entity_id = $1 order by created_at desc limit 1",
      [IDS.psychB],
    );
    expect(audit.rows[0].action).toBe("admin.user.status_changed");

    await asUser(
      IDS.admin,
      (db) =>
        db.query("select public.admin_set_account_status($1, 'active', null)", [IDS.psychB]),
      { commit: true },
    );

    const pending = await admin.query(
      "select status from public.psychologist_profiles where user_id = $1",
      [IDS.psychB],
    );
    expect(pending.rows[0].status).toBe("pending");
  });

  it("ștergerea unui psiholog elimină în cascadă programările și profilul profesional", async () => {
    const appointmentId = await insertAppointment({
      clientId: IDS.clientA,
      startsAt: "2027-02-15T07:00:00Z",
      status: "pending",
    });

    const deleted = await admin.query("delete from auth.users where id = $1", [IDS.psychA]);
    expect(deleted.rowCount).toBe(1);

    const appointments = await admin.query(
      "select count(*)::int as count from public.appointments where id = $1",
      [appointmentId],
    );
    expect(appointments.rows[0].count).toBe(0);

    const profile = await admin.query(
      "select count(*)::int as count from public.psychologist_profiles where user_id = $1",
      [IDS.psychA],
    );
    expect(profile.rows[0].count).toBe(0);
  });
});
