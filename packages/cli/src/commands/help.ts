import chalk from "chalk";

export const showHelp = () => {
  console.log(`
${chalk.cyanBright("✨ Verza UI CLI ✨")} - Build UI components with ease

${chalk.bold("Commands:")}
  ${chalk.yellow("init")}             Initialize a new Verza UI project
  ${chalk.yellow("add <Component>")}  Add a new component to your project
  ${chalk.yellow("--help, -h")}       Show this help message
  `);
};
