#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const container = process.env.TEST_DB_CONTAINER ?? "platforma-psihologi-test";
const result = spawnSync("docker", ["rm", "-f", container], { stdio: "inherit" });
if (result.status !== 0) {
  console.error("Containerul nu a putut fi oprit (poate nu există).");
}
process.exitCode = 0;
