#!/usr/bin/env node

import { parseArgs } from "./utils";
import { addComponent, initializeVerza, showHelp } from "./commands";

const { command, target } = parseArgs();

switch (command) {
  case "init":
    initializeVerza();
    break;

  case "add":
    addComponent(target);
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
