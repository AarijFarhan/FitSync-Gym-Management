const fs = require("node:fs");
const path = require("node:path");

const packageManager = process.env.npm_config_user_agent ?? "";

for (const lockfile of ["package-lock.json", "yarn.lock"]) {
  fs.rmSync(path.join(process.cwd(), lockfile), { force: true });
}

if (!packageManager.startsWith("pnpm/")) {
  console.error("Use pnpm instead of npm or yarn for this workspace.");
  process.exit(1);
}