#!/usr/bin/env node

import { parseArgs } from "./utils";
import { addItem, initializeVerza, showHelp } from "./commands";
import { showVersion } from "./commands/version";

async function main() {
  const { command, target } = parseArgs();

  try {
    switch (command) {
      case "init":
        await initializeVerza();
        break;

      case "add":
        await addItem(target);
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
