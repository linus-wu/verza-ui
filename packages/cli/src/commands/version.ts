import chalk from "chalk";
import { CLI_VERSION } from "../config";

export function showVersion() {
  console.log(chalk.cyan(`v${CLI_VERSION}`));
}
