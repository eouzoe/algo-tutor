// ioi-forge nu process wrapper — minimal process spawn for tools that still use forge.nu.
// Future: migrate these to direct engine calls.

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function forge(cmd: string): string {
  const r = spawnSync("nu", ["-c", `use "${ROOT}/.nu/forge.nu" *; ${cmd}`], {
    encoding: "utf8",
    timeout: 120_000,
    env: { ...process.env, FORGE_ROOT: ROOT },
  });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
  return out || "(完成，無輸出)";
}
