#!/usr/bin/env node
/**
 * Pornește un PostgreSQL efemer în Docker și aplică toate migrațiile.
 * Necesită Docker Desktop pornit. Nu atinge nicio bază de date existentă.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const container = process.env.TEST_DB_CONTAINER ?? "platforma-psihologi-test";
const port = process.env.TEST_DB_PORT ?? "55432";
const connectionString =
  process.env.TEST_DATABASE_URL ??
  `postgresql://postgres:postgres@127.0.0.1:${port}/postgres`;

function run(command, args, options = {}) {
  return spawnSync(command, args, { stdio: "inherit", ...options });
}

console.log("› Verificare Docker...");
const externalUrl = process.env.TEST_DATABASE_URL;
const dockerVersion = run("docker", ["--version"], { stdio: "ignore" });

if (externalUrl) {
  console.log("› Folosesc baza de date indicată de TEST_DATABASE_URL (fără Docker).");
} else if (dockerVersion.status !== 0) {
  console.error(
    "Docker nu este disponibil. Pornește Docker Desktop sau setează TEST_DATABASE_URL către un PostgreSQL local.",
  );
  process.exit(1);
} else {
  console.log(`› Recreare container ${container} pe portul ${port}...`);
  run("docker", ["rm", "-f", container], { stdio: "ignore" });
  const started = run("docker", [
    "run",
    "-d",
    "--name",
    container,
    "-e",
    "POSTGRES_PASSWORD=postgres",
    "-p",
    `${port}:5432`,
    "postgres:17-alpine",
  ]);
  if (started.status !== 0) {
    console.error("Containerul PostgreSQL nu a pornit.");
    process.exit(1);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDatabase() {
  let lastError;
  for (let attempt = 1; attempt <= 45; attempt += 1) {
    const client = new Client({ connectionString, connectionTimeoutMillis: 1000 });
    try {
      await client.connect();
      await client.query("select 1");
      await client.end();
      return;
    } catch (error) {
      lastError = error;
      await client.end().catch(() => {});
      await sleep(1000);
    }
  }
  throw lastError ?? new Error("Baza de date nu a răspuns.");
}

async function applySqlFiles(client, files) {
  for (const file of files) {
    const sql = readFileSync(file, "utf8");
    process.stdout.write(`  · ${file.replace(root + "\\", "").replace(root + "/", "")}\n`);
    await client.query(sql);
  }
}

try {
  console.log("› Aștept PostgreSQL...");
  await waitForDatabase();

  const client = new Client({ connectionString });
  await client.connect();

  console.log("› Aplic stub-ul Supabase (roluri + auth)...");
  await applySqlFiles(client, [join(root, "supabase", "tests", "00_supabase_stub.sql")]);

  const migrationDir = join(root, "supabase", "migrations");
  const migrations = readdirSync(migrationDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => join(migrationDir, file));

  console.log(`› Aplic ${migrations.length} migrații...`);
  await applySqlFiles(client, migrations);

  await client.end();
  console.log("\n✓ Baza de date de test este pregătită.");
  console.log(`  TEST_DATABASE_URL=${connectionString}`);
  console.log("  Rulează: npm run test:db");
} catch (error) {
  console.error("\n✗ Configurarea bazei de date a eșuat:", error.message);
  process.exitCode = 1;
}
