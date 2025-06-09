import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { VerzaConfig } from "../types";
import { CONFIG_FILE_NAME } from "../config";

export const loadVerzaConfig = (): VerzaConfig | null => {
  try {
    const filePath = path.join(process.cwd(), CONFIG_FILE_NAME);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const configData = fs.readFileSync(filePath, "utf8");
    const config = JSON.parse(configData) as VerzaConfig;

    if (!config.paths || !config.paths.components) {
      console.error(
        chalk.red("❌ Configuration file is invalid or corrupted.")
      );
      console.log(chalk.gray("   Missing required 'paths.components' field."));
      console.log(
        chalk.yellow(
          "💡 Try running 'npx verza-ui init --force' to recreate the configuration."
        )
      );
      process.exit(1);
    }

    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(
        chalk.red(
          `❌ Configuration file contains invalid JSON: ${error.message}`
        )
      );
      console.log(
        chalk.gray(`   File: ${path.join(process.cwd(), CONFIG_FILE_NAME)}`)
      );
    } else {
      console.error(
        chalk.red("❌ Failed to read the configuration file:"),
        error
      );
    }

    console.log(
      chalk.yellow(
        "💡 Try running 'npx verza-ui init --force' to recreate the configuration."
      )
    );
    process.exit(1);
  }
};
