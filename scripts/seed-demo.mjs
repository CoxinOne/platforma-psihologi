#!/usr/bin/env node
/**
 * Populează proiectul Supabase cu date DEMONSTRATIVE, fictive.
 * Necesită SUPABASE_SERVICE_ROLE_KEY în .env.local.
 *
 * Conturi create (parola: Demo1234!):
 *   admin@demo.exemplu.test
 *   ana@demo.exemplu.test
 *   mihai@demo.exemplu.test
 *   elena@demo.exemplu.test
 *   radu@demo.exemplu.test
 *
 * Toate profilurile au is_demo = true și sunt marcate vizual în aplicație.
 */
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const PASSWORD = "Demo12345!";
const TIMEZONE = "Europe/Bucharest";

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Lipsește NEXT_PUBLIC_SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY. Completează .env.local.",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ACCOUNTS = [
  { key: "admin", email: "admin@demo.exemplu.test", fullName: "Administrator Demo", role: "admin" },
  { key: "ana", email: "ana@demo.exemplu.test", fullName: "Ana Popescu", role: "psychologist" },
  { key: "mihai", email: "mihai@demo.exemplu.test", fullName: "Mihai Ionescu", role: "psychologist" },
  { key: "ioana", email: "ioana.marinescu@demo.exemplu.test", fullName: "Ioana Marinescu", role: "psychologist" },
  { key: "andrei", email: "andrei.constantin@demo.exemplu.test", fullName: "Andrei Constantin", role: "psychologist" },
  { key: "maria", email: "maria.stan@demo.exemplu.test", fullName: "Maria Stan", role: "psychologist" },
  { key: "vlad", email: "vlad.dumitrescu@demo.exemplu.test", fullName: "Vlad Dumitrescu", role: "psychologist" },
  { key: "raluca", email: "raluca.mihai@demo.exemplu.test", fullName: "Raluca Mihai", role: "psychologist" },
  { key: "stefan", email: "stefan.ionescu@demo.exemplu.test", fullName: "Ștefan Ionescu", role: "psychologist" },
  { key: "diana", email: "diana.popa@demo.exemplu.test", fullName: "Diana Popa", role: "psychologist" },
  { key: "bogdan", email: "bogdan.pavel@demo.exemplu.test", fullName: "Bogdan Pavel", role: "psychologist" },
  { key: "cristina", email: "cristina.neagu@demo.exemplu.test", fullName: "Cristina Neagu", role: "psychologist" },
  { key: "alexandru", email: "alexandru.radu@demo.exemplu.test", fullName: "Alexandru Radu", role: "psychologist" },
  { key: "elena", email: "elena@demo.exemplu.test", fullName: "Elena Dumitrescu", role: "client" },
  { key: "radu", email: "radu@demo.exemplu.test", fullName: "Radu Marinescu", role: "client" },
];

async function findUsers() {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  return data.users;
}

async function ensureUser(account, usersByEmail) {
  const existing = usersByEmail.get(account.email);
  if (existing) return existing;

  const { data, error } = await admin.auth.admin.createUser({
    email: account.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: account.fullName,
      terms_accepted_at: new Date().toISOString(),
    },
  });

  if (error) throw new Error(`Creare ${account.email}: ${error.message}`);
  return data.user;
}

async function main() {
  console.log("› Se creează conturile demonstrative…");
  const users = await findUsers();
  const usersByEmail = new Map(users.map((user) => [user.email, user]));

  const ids = {};
  for (const account of ACCOUNTS) {
    const user = await ensureUser(account, usersByEmail);
    ids[account.key] = user.id;
    const { error } = await admin
      .from("profiles")
      .update({
        role: account.role,
        requested_role: null,
        full_name: account.fullName,
        status: "active",
        is_demo: true,
        terms_accepted_at: new Date().toISOString(),
        privacy_accepted_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) throw new Error(`Profil ${account.email}: ${error.message}`);
  }

  console.log("› Se creează cabinetele demonstrative…");
  const cabinets = [
    {
      slug: "cabinet-demo-central",
      name: "Cabinet Demo Central",
      address_line: "Strada Exemplu nr. 10, etaj 2",
      city: "București",
      county: "București",
      postal_code: "010101",
      phone: "0210000000",
      description:
        "Date demonstrative. Adresa este fictivă și nu corespunde unui cabinet real. Se folosește doar pentru testarea platformei.",
      is_active: true,
      is_demo: true,
    },
    {
      slug: "cabinet-demo-cluj",
      name: "Cabinet Demo Cluj",
      address_line: "Bulevardul Exemplu nr. 25",
      city: "Cluj-Napoca",
      county: "Cluj",
      postal_code: "400001",
      phone: "0264000000",
      description:
        "Date demonstrative. Locație fictivă pentru testarea profilurilor publice.",
      is_active: true,
      is_demo: true,
    },
    {
      slug: "cabinet-demo-iasi",
      name: "Cabinet Demo Iași",
      address_line: "Strada Exemplu nr. 7",
      city: "Iași",
      county: "Iași",
      postal_code: "700001",
      phone: "0232000000",
      description: "Date demonstrative. Locație fictivă pentru testarea platformei.",
      is_active: true,
      is_demo: true,
    },
    {
      slug: "cabinet-demo-timisoara",
      name: "Cabinet Demo Timișoara",
      address_line: "Bulevardul Exemplu nr. 12",
      city: "Timișoara",
      county: "Timiș",
      postal_code: "300001",
      phone: "0256000000",
      description: "Date demonstrative. Locație fictivă pentru testarea platformei.",
      is_active: true,
      is_demo: true,
    },
    {
      slug: "cabinet-demo-brasov",
      name: "Cabinet Demo Brașov",
      address_line: "Strada Exemplu nr. 3",
      city: "Brașov",
      county: "Brașov",
      postal_code: "500001",
      phone: "0268000000",
      description: "Date demonstrative. Locație fictivă pentru testarea platformei.",
      is_active: true,
      is_demo: true,
    },
    {
      slug: "cabinet-demo-sibiu",
      name: "Cabinet Demo Sibiu",
      address_line: "Piața Exemplu nr. 5",
      city: "Sibiu",
      county: "Sibiu",
      postal_code: "550001",
      phone: "0269000000",
      description: "Date demonstrative. Locație fictivă pentru testarea platformei.",
      is_active: true,
      is_demo: true,
    },
  ];

  const cabinetIds = {};
  for (const cabinet of cabinets) {
    const { data, error } = await admin
      .from("cabinets")
      .upsert(cabinet, { onConflict: "slug" })
      .select("id")
      .single();
    if (error) throw new Error(`Cabinet ${cabinet.slug}: ${error.message}`);
    cabinetIds[cabinet.slug] = data.id;
  }

  const { data: specialties, error: specialtyError } = await admin
    .from("specialties")
    .select("id, slug");
  if (specialtyError) throw specialtyError;
  const specialtyBySlug = new Map(specialties.map((item) => [item.slug, item.id]));

  const profiles = [
    {
      user_id: ids.ana,
      slug: "ana-popescu-demo",
      display_name: "Ana Popescu",
      professional_title: "Psiholog clinician, psihoterapeut",
      bio: "Profil demonstrativ. Acompaniez adulții care se confruntă cu anxietate, epuizare și dificultăți de adaptare. Lucrăm într-un ritm clar, cu obiective stabilite împreună. Textul este fictiv și servește exclusiv testării platformei.",
      education:
        "Studii demonstrative: licență în psihologie, masterat în psihologie clinică și formare în psihoterapie cognitiv-comportamentală. Calificările nu sunt reale.",
      experience:
        "Experiență demonstrativă: consiliere individuală pentru adulți, ateliere de gestionare a stresului. Nu reprezintă o persoană reală.",
      languages: ["română", "engleză"],
      consultation_modes: ["online", "in_person"],
      session_duration_minutes: 50,
      price_ron: null,
      status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: ids.admin,
      published_at: new Date().toISOString(),
      is_demo: true,
      is_accepting_new_clients: true,
      professional_registry_number: "DEMO-001",
      timezone: TIMEZONE,
      specialties: ["anxietate", "psihoterapie-cognitiv-comportamentala", "depresie"],
      cabinet: "cabinet-demo-central",
    },
    {
      user_id: ids.mihai,
      slug: "mihai-ionescu-demo",
      display_name: "Mihai Ionescu",
      professional_title: "Psihoterapeut sistemic",
      bio: "Profil demonstrativ. Lucrez cu cupluri și familii care vor să îmbunătățească comunicarea și să traverseze mai bine perioadele dificile. Datele sunt fictive, pentru testare.",
      education:
        "Studii demonstrative: psihologie, formare în psihoterapie sistemică de familie și cuplu. Nu sunt calificări reale.",
      experience:
        "Experiență demonstrativă: consiliere de cuplu și intervenții familiale. Profil fictiv.",
      languages: ["română", "maghiară"],
      consultation_modes: ["online", "in_person"],
      session_duration_minutes: 60,
      price_ron: null,
      status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: ids.admin,
      published_at: new Date().toISOString(),
      is_demo: true,
      is_accepting_new_clients: true,
      professional_registry_number: "DEMO-002",
      timezone: TIMEZONE,
      specialties: ["consiliere-cuplu", "psihoterapie-sistemica"],
      cabinet: "cabinet-demo-cluj",
    },
    {
      user_id: ids.ioana,
      slug: "ioana-marinescu-demo",
      display_name: "Ioana Marinescu",
      professional_title: "Psiholog clinician, psihoterapeut",
      bio: "Profil demonstrativ. Lucrez cu adulți care se confruntă cu anxietate, stres profesional și tranziții de viață. Îmi propun un cadru clar și blând, cu obiective stabilite împreună.",
      education:
        "Studii demonstrative: licență în psihologie, masterat în psihologie clinică și formare în psihoterapie cognitiv-comportamentală. Calificările nu sunt reale.",
      experience:
        "Experiență demonstrativă: consiliere individuală pentru adulți și ateliere de gestionare a stresului. Profil fictiv.",
      languages: ["română", "engleză"],
      consultation_modes: ["online", "in_person"],
      session_duration_minutes: 50,
      price_ron: null,
      status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: ids.admin,
      published_at: new Date().toISOString(),
      is_demo: true,
      is_accepting_new_clients: true,
      professional_registry_number: "DEMO-003",
      timezone: TIMEZONE,
      specialties: ["anxietate", "psihoterapie-cognitiv-comportamentala"],
      cabinet: "cabinet-demo-central",
    },
    {
      user_id: ids.andrei,
      slug: "andrei-constantin-demo",
      display_name: "Andrei Constantin",
      professional_title: "Psiholog clinician",
      bio: "Profil demonstrativ. Acompaniez adulții cu episoade depresive, oboseală și dificultăți de concentrare. Lucrăm cu pași mici și măsurabili, într-un ritm sustenabil.",
      education:
        "Studii demonstrative: psihologie clinică și formare în evaluare psihologică. Nu sunt calificări reale.",
      experience: "Experiență demonstrativă: evaluare și consiliere individuală. Profil fictiv.",
      languages: ["română", "engleză"],
      consultation_modes: ["online"],
      session_duration_minutes: 50,
      price_ron: null,
      status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: ids.admin,
      published_at: new Date().toISOString(),
      is_demo: true,
      is_accepting_new_clients: true,
      professional_registry_number: "DEMO-004",
      timezone: TIMEZONE,
      specialties: ["depresie", "psihologie-clinica"],
      cabinet: "cabinet-demo-cluj",
    },
    {
      user_id: ids.maria,
      slug: "maria-stan-demo",
      display_name: "Maria Stan",
      professional_title: "Psiholog pentru copii și adolescenți",
      bio: "Profil demonstrativ. Lucrez cu copii, adolescenți și părinți care au nevoie de sprijin pentru emoții intense, adaptare școlară și relații. Include evaluare psihologică.",
      education:
        "Studii demonstrative: psihologie și masterat în psihologia copilului. Nu sunt calificări reale.",
      experience:
        "Experiență demonstrativă: evaluări psihologice și consiliere pentru copii și adolescenți. Profil fictiv.",
      languages: ["română"],
      consultation_modes: ["in_person"],
      session_duration_minutes: 50,
      price_ron: null,
      status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: ids.admin,
      published_at: new Date().toISOString(),
      is_demo: true,
      is_accepting_new_clients: true,
      professional_registry_number: "DEMO-005",
      timezone: TIMEZONE,
      specialties: ["psihologie-copil-adolescent", "evaluare-psihologica"],
      cabinet: "cabinet-demo-iasi",
    },
    {
      user_id: ids.vlad,
      slug: "vlad-dumitrescu-demo",
      display_name: "Vlad Dumitrescu",
      professional_title: "Psihoterapeut",
      bio: "Profil demonstrativ. Mă concentrez pe dependențe comportamentale, disciplină personală și schimbarea obiceiurilor. Folosesc obiective concrete și revizuiri periodice.",
      education:
        "Studii demonstrative: psihologie și formare în consiliere pentru adicții. Nu sunt calificări reale.",
      experience:
        "Experiență demonstrativă: consiliere individuală și grupuri de suport. Profil fictiv.",
      languages: ["română", "engleză"],
      consultation_modes: ["online", "in_person"],
      session_duration_minutes: 60,
      price_ron: null,
      status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: ids.admin,
      published_at: new Date().toISOString(),
      is_demo: true,
      is_accepting_new_clients: true,
      professional_registry_number: "DEMO-006",
      timezone: TIMEZONE,
      specialties: ["adictii", "dezvoltare-personala"],
      cabinet: "cabinet-demo-timisoara",
    },
    {
      user_id: ids.raluca,
      slug: "raluca-mihai-demo",
      display_name: "Raluca Mihai",
      professional_title: "Psihoterapeut de cuplu",
      bio: "Profil demonstrativ. Lucrez cu cupluri care vor să îmbunătățească comunicarea, să gestioneze conflictele și să reconstruiască încrederea. Cadrul este neutru și structurat.",
      education:
        "Studii demonstrative: psihologie și formare în psihoterapie sistemică de cuplu. Nu sunt calificări reale.",
      experience: "Experiență demonstrativă: consiliere de cuplu și intervenții familiale. Profil fictiv.",
      languages: ["română", "engleză"],
      consultation_modes: ["online", "in_person"],
      session_duration_minutes: 60,
      price_ron: null,
      status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: ids.admin,
      published_at: new Date().toISOString(),
      is_demo: true,
      is_accepting_new_clients: true,
      professional_registry_number: "DEMO-007",
      timezone: TIMEZONE,
      specialties: ["consiliere-cuplu", "psihoterapie-sistemica"],
      cabinet: "cabinet-demo-brasov",
    },
    {
      user_id: ids.stefan,
      slug: "stefan-ionescu-demo",
      display_name: "Ștefan Ionescu",
      professional_title: "Psihoterapeut psihodinamic",
      bio: "Profil demonstrativ. Lucrez cu adulți care se confruntă cu traumă, anxietate și tipare relaționale repetitive. Procesul este exploratoriu și respectuos.",
      education:
        "Studii demonstrative: psihologie și formare în psihoterapie psihodinamică. Nu sunt calificări reale.",
      experience:
        "Experiență demonstrativă: psihoterapie individuală și consiliere pentru traumă. Profil fictiv.",
      languages: ["română", "maghiară"],
      consultation_modes: ["online", "in_person"],
      session_duration_minutes: 50,
      price_ron: null,
      status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: ids.admin,
      published_at: new Date().toISOString(),
      is_demo: true,
      is_accepting_new_clients: true,
      professional_registry_number: "DEMO-008",
      timezone: TIMEZONE,
      specialties: ["psihotraumatologie", "psihoterapie-psihodinamica"],
      cabinet: "cabinet-demo-sibiu",
    },
    {
      user_id: ids.diana,
      slug: "diana-popa-demo",
      display_name: "Diana Popa",
      professional_title: "Psiholog clinician",
      bio: "Profil demonstrativ. Ofer sprijin pentru anxietate, depresie și perioade de criză. Lucrăm cu resursele tale și cu obiective realiste.",
      education:
        "Studii demonstrative: psihologie clinică și formare în intervenții cognitiv-comportamentale. Nu sunt calificări reale.",
      experience: "Experiență demonstrativă: consiliere individuală pentru adulți. Profil fictiv.",
      languages: ["română", "engleză"],
      consultation_modes: ["online"],
      session_duration_minutes: 50,
      price_ron: null,
      status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: ids.admin,
      published_at: new Date().toISOString(),
      is_demo: true,
      is_accepting_new_clients: true,
      professional_registry_number: "DEMO-009",
      timezone: TIMEZONE,
      specialties: ["anxietate", "depresie"],
      cabinet: "cabinet-demo-central",
    },
    {
      user_id: ids.bogdan,
      slug: "bogdan-pavel-demo",
      display_name: "Bogdan Pavel",
      professional_title: "Psihoterapeut sistemic",
      bio: "Profil demonstrativ. Lucrez cu familii și cupluri care traversează schimbări și conflicte. Obiectivul este o comunicare mai clară și limite sănătoase.",
      education:
        "Studii demonstrative: psihologie și formare în psihoterapie sistemică. Nu sunt calificări reale.",
      experience: "Experiență demonstrativă: consiliere de familie și cuplu. Profil fictiv.",
      languages: ["română", "engleză"],
      consultation_modes: ["in_person"],
      session_duration_minutes: 60,
      price_ron: null,
      status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: ids.admin,
      published_at: new Date().toISOString(),
      is_demo: true,
      is_accepting_new_clients: true,
      professional_registry_number: "DEMO-010",
      timezone: TIMEZONE,
      specialties: ["consiliere-cuplu", "psihoterapie-sistemica"],
      cabinet: "cabinet-demo-cluj",
    },
    {
      user_id: ids.cristina,
      slug: "cristina-neagu-demo",
      display_name: "Cristina Neagu",
      professional_title: "Psiholog clinician, psihoterapeut",
      bio: "Profil demonstrativ. Acompaniez copii și adolescenți cu anxietate, dificultăți școlare și schimbări familiale. Colaborez cu părinții pentru obiective comune.",
      education:
        "Studii demonstrative: psihologie clinică și formare în psihoterapie cognitiv-comportamentală. Nu sunt calificări reale.",
      experience:
        "Experiență demonstrativă: consiliere pentru copii, adolescenți și părinți. Profil fictiv.",
      languages: ["română"],
      consultation_modes: ["online", "in_person"],
      session_duration_minutes: 50,
      price_ron: null,
      status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: ids.admin,
      published_at: new Date().toISOString(),
      is_demo: true,
      is_accepting_new_clients: true,
      professional_registry_number: "DEMO-011",
      timezone: TIMEZONE,
      specialties: ["psihologie-copil-adolescent", "anxietate"],
      cabinet: "cabinet-demo-iasi",
    },
    {
      user_id: ids.alexandru,
      slug: "alexandru-radu-demo",
      display_name: "Alexandru Radu",
      professional_title: "Psiholog clinician",
      bio: "Profil demonstrativ. Lucrez cu dezvoltare personală, carieră și tranziții profesionale. Punem în ordine prioritățile și construim un plan aplicabil.",
      education:
        "Studii demonstrative: psihologie și masterat în psihologie clinică. Nu sunt calificări reale.",
      experience: "Experiență demonstrativă: consiliere individuală pentru adulți. Profil fictiv.",
      languages: ["română", "engleză"],
      consultation_modes: ["online", "in_person"],
      session_duration_minutes: 50,
      price_ron: null,
      status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: ids.admin,
      published_at: new Date().toISOString(),
      is_demo: true,
      is_accepting_new_clients: true,
      professional_registry_number: "DEMO-012",
      timezone: TIMEZONE,
      specialties: ["dezvoltare-personala", "psihologie-clinica"],
      cabinet: "cabinet-demo-timisoara",
    },
  ];

  console.log("› Se creează profilurile profesionale…");
  for (const profile of profiles) {
    const { specialties: specialtySlugs, cabinet, ...record } = profile;
    const { error } = await admin
      .from("psychologist_profiles")
      .upsert(record, { onConflict: "user_id" });
    if (error) throw new Error(`Profil ${profile.slug}: ${error.message}`);

    await admin.from("psychologist_specialties").delete().eq("psychologist_id", record.user_id);
    const links = specialtySlugs.map((slug) => ({
      psychologist_id: record.user_id,
      specialty_id: specialtyBySlug.get(slug),
    }));
    if (links.every((link) => link.specialty_id)) {
      const { error: linkError } = await admin.from("psychologist_specialties").insert(links);
      if (linkError) throw linkError;
    }

    await admin.from("psychologist_cabinets").delete().eq("psychologist_id", record.user_id);
    const { error: cabinetLinkError } = await admin.from("psychologist_cabinets").insert({
      psychologist_id: record.user_id,
      cabinet_id: cabinetIds[cabinet],
      is_primary: true,
    });
    if (cabinetLinkError) throw cabinetLinkError;
  }

  console.log("› Se creează o conversație demonstrativă…");
  const { data: existingConversation } = await admin
    .from("conversations")
    .select("id")
    .eq("client_id", ids.elena)
    .eq("psychologist_id", ids.ana)
    .maybeSingle();

  let conversationId = existingConversation?.id;
  if (!conversationId) {
    const { data, error } = await admin
      .from("conversations")
      .insert({ client_id: ids.elena, psychologist_id: ids.ana })
      .select("id")
      .single();
    if (error) throw error;
    conversationId = data.id;

    await admin.from("conversation_participants").insert([
      { conversation_id: conversationId, user_id: ids.elena, role_in_conversation: "client" },
      { conversation_id: conversationId, user_id: ids.ana, role_in_conversation: "psychologist" },
    ]);

    const { error: messageError } = await admin.from("messages").insert([
      {
        conversation_id: conversationId,
        sender_id: ids.elena,
        body: "Bună ziua! Aș dori o primă discuție despre gestionarea anxietății. (mesaj demonstrativ)",
      },
      {
        conversation_id: conversationId,
        sender_id: ids.ana,
        body: "Bună, Elena! Îți mulțumesc pentru mesaj. Putem începe cu o ședință de 50 de minute, online sau la cabinet. (răspuns demonstrativ)",
      },
    ]);
    if (messageError) throw messageError;
  }

  // Modulul de programări nu mai este expus. Ștergem eventualele programări demo
  // create de versiunile anterioare, ca datele demo să fie consecvente.
  console.log("› Se elimină programările demo vechi…");
  await admin
    .from("appointments")
    .delete()
    .in("client_id", [ids.elena, ids.radu])
    .in("psychologist_id", [ids.ana, ids.mihai]);

  await admin
    .from("notifications")
    .delete()
    .in("user_id", Object.values(ids))
    .in("type", [
      "appointment_requested",
      "appointment_confirmed",
      "appointment_rejected",
      "appointment_cancelled",
      "appointment_rescheduled",
      "appointment_completed",
    ]);

  console.log("\n✓ Date demonstrative pregătite.");
  console.log("  Parola pentru toate conturile: " + PASSWORD);
  for (const account of ACCOUNTS) {
    console.log(`  ${account.role.padEnd(13)} ${account.email}`);
  }
  console.log("\n  Toate datele sunt fictive și marcate is_demo=true.");
  console.log(`  Aplicație: ${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}`);
}

main().catch((error) => {
  console.error("✗ Seed eșuat:", error.message);
  process.exitCode = 1;
});
