import chalk from "chalk";
import { CLI_VERSION } from "../config";

export const showHelp = () => {
  console.log(`
${chalk.cyanBright("✨ Verza UI CLI ✨")} ${chalk.gray(`v${CLI_VERSION}`)}
${chalk.gray("A modern UI component library CLI tool")}

${chalk.bold("USAGE:")}
${chalk.cyan("npx verza-ui <command> [options]")}

${chalk.bold("COMMANDS:")}
  ${chalk.yellow(
    "init"
  )}                     Initialize Verza UI in your project
  ${chalk.yellow(
    "add <name>"
  )}               Add a component, hook, or utility to your project
  ${chalk.yellow(
    "add list"
  )}                 List all available components, hooks, and utilities
  ${chalk.yellow("--version, -v")}            Show CLI version
  ${chalk.yellow("--help, -h")}               Show this help message

${chalk.bold("OPTIONS:")}
  ${chalk.yellow(
    "--force, -f"
  )}              Force reinitialize (for init command)
  ${chalk.yellow(
    "--list, -l"
  )}               List available modules (for add command)

${chalk.bold("EXAMPLES:")}
  ${chalk.gray("npx verza-ui init")}
  ${chalk.gray("npx verza-ui init --force")}
  ${chalk.gray("npx verza-ui add Button")}
  ${chalk.gray("npx verza-ui add list")}
  ${chalk.gray("npx verza-ui add -l")}

${chalk.bold("LEARN MORE:")}
  ${chalk.gray("Documentation: https://verzaui.com/docs")}
  ${chalk.gray("GitHub: https://github.com/verzaui/verza-ui")}
  `);
};
