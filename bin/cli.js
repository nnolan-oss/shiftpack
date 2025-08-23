#!/usr/bin/env node
import { Command } from "commander";
import { runMigration } from "../src/runMigration.js";

const program = new Command();

program
  .name("shiftpack")
  .description("React and ecosystem migration tool powered by jscodeshift")
  .version("0.1.0")
  .enablePositionalOptions(true);   // ⚡ parent-da yoqish kerak

program
  .command("migrate <migration>")
  .allowUnknownOption(true)         // notanish optionlarni ruxsat ber
  .passThroughOptions(true)         // jscodeshift flaglarini to‘liq o‘tkaz
  .option("-p, --path <dir>", "Source directory", "src")
  .action((migration, options, command) => {
    // commander parent rawArgs orqali qolgan optionlarni olish
    const rawArgs = command.parent.rawArgs;
    const migrateIndex = rawArgs.indexOf("migrate");
    const extraArgs = rawArgs.slice(migrateIndex + 2); // migration va path’dan keyingi argumentlar

    runMigration(migration, options, extraArgs);
  });

program.parse(process.argv);
