#!/usr/bin/env node

import { parseArgs } from "./utils";
import { initializeVerza, addModule, showVersion, showHelp } from "./commands";

async function main() {
  const { command, target, flags } = parseArgs();

  try {
    switch (command) {
      case "init":
        await initializeVerza(flags);
        break;

      case "add":
        await addModule(target, flags);
        break;

      case "--version":
      case "-v":
        showVersion();
        break;

      case "--help":
      case "-h":
        showHelp();
        break;

      default:
        console.log(
          "Oops! Unknown command. Try `npx verza-ui --help` for more information."
        );
        break;
    }
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

main();
