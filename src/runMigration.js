import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export function runMigration(migration, options, extraArgs = []) {
  let migrationPath = migration;

  if (!migrationPath.endsWith(".js")) {
    migrationPath += ".js";
  }

  migrationPath = path.resolve("migrations", migrationPath);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  console.log(`🚀 Running migration: ${migrationPath} on ${options.path}`);

  // Agar user extra flag bermagan bo‘lsa, default extensions ni qo‘shamiz
  const hasExtensions = extraArgs.some(arg => arg.startsWith("--extensions"));
  const hasParser = extraArgs.some(arg => arg.startsWith("--parser"));

  const defaults = [];
  if (!hasExtensions) {
    defaults.push("--extensions=js,jsx,ts,tsx");
  }
  if (!hasParser) {
    defaults.push("--parser=tsx"); // TypeScript+JSX eng umumiy parser
  }

  const cmd = [
    "jscodeshift",
    "-t", migrationPath,
    options.path,
    ...defaults,
    ...extraArgs
  ].join(" ");

  execSync(cmd, { stdio: "inherit" });
}
