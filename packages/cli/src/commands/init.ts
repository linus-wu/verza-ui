import chalk from "chalk";
import {
  detectFrameworkType,
  validateProjectEnvironment,
  shouldExitDueToExistingConfig,
  handleNextjsProject,
  handleNonNextjsProject,
} from "../utils";

export async function initializeVerza(flags: Record<string, boolean> = {}) {
  const forceInit = flags.force;

  // (Ctrl+C) to interrupt
  process.on("SIGINT", () => {
    console.log(chalk.yellow("\n⚠️  Setup interrupted"));
    console.log(chalk.gray("   You can run this command again anytime."));
    process.exit(0);
  });

  try {
    console.log(chalk.blue("🌌 Welcome to Verza UI"));

    await validateProjectEnvironment();

    const shouldExit = await shouldExitDueToExistingConfig(forceInit);
    if (shouldExit) return;

    const frameworkType = detectFrameworkType();

    if (frameworkType === "nextjs") {
      await handleNextjsProject();
    } else {
      await handleNonNextjsProject();
    }
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("EACCES") ||
        error.message.includes("permission denied")
      ) {
        console.error(chalk.red("❌ Permission denied"));
        console.log(
          chalk.gray(
            "   Please ensure you have write access to this directory."
          )
        );
      } else if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("network")
      ) {
        console.error(chalk.red("❌ Network error"));
        console.log(
          chalk.gray("   Please check your internet connection and try again.")
        );
      } else if (error.message.includes("ENOSPC")) {
        console.error(chalk.red("❌ Insufficient disk space"));
        console.log(
          chalk.gray("   Please free up some disk space and try again.")
        );
      } else {
        console.error(chalk.red("❌ Initialization failed:"), error.message);
      }
    } else {
      console.error(chalk.red("❌ Initialization failed:"), error);
    }

    console.log(
      chalk.yellow(
        "\n💡 Try running with --force to overwrite existing configuration"
      )
    );

    process.exit(1);
  }
}
