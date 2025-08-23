#!/usr/bin/env node
import { Command } from "commander";
import { runMigration } from "../src/runMigration.js";

const program = new Command();

program
  .name("shiftpack")
  .description("React and ecosystem migration tool powered by jscodeshift")
  .version("0.1.0")
  .enablePositionalOptions(true);   

program
  .command("migrate <migration>")
  .allowUnknownOption(true)         
  .passThroughOptions(true)         
  .option("-p, --path <dir>", "Source directory", "src")
  .action((migration, options, command) => {
    const rawArgs = command.parent.rawArgs;
    const migrateIndex = rawArgs.indexOf("migrate");
    const extraArgs = rawArgs.slice(migrateIndex + 2); 

    runMigration(migration, options, extraArgs);
  });

program.parse(process.argv);
