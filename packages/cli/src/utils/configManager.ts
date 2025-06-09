import chalk from "chalk";
import inquirer from "inquirer";
import { VerzaConfig } from "../types";
import { CONFIG_FILE_NAME } from "../config";
import {
  checkFileExists,
  isUsingTypeScript,
  writeJsonFile,
  loadVerzaConfig,
} from ".";
import { validatePathInput, PathType } from "./validators";

// Constants
export const DEFAULT_PATHS = {
  components: "@/components/verza-ui",
  hooks: "@/hooks/verza-ui",
  utils: "@/utils",
} as const;

export const DOCUMENTATION_LINKS = {
  main: "https://verza-ui.com/docs/installation",
  vite: "https://verza-ui.com/docs/installation/vite",
  manual: "https://verza-ui.com/docs/installation/manual",
} as const;

// Type definitions
export interface PathConfiguration {
  components: string;
  hooks: string;
  utils: string;
}

/**
 * Check if should exit due to existing config
 */
export async function shouldExitDueToExistingConfig(
  forceInit: boolean
): Promise<boolean> {
  if (!checkFileExists(CONFIG_FILE_NAME)) {
    return false;
  }

  if (forceInit) {
    console.log(
      chalk.yellow(
        "⚠️  Using --force option, overwriting existing configuration..."
      )
    );
    return false;
  }

  console.log(chalk.yellow("⚠️  Verza UI configuration file already exists"));

  // Display current configuration
  try {
    const currentConfig = loadVerzaConfig();
    if (currentConfig) {
      console.log(chalk.gray("\nCurrent configuration:"));
      console.log(
        chalk.gray(`  TypeScript: ${currentConfig.typescript ? "Yes" : "No"}`)
      );
      console.log(
        chalk.gray(`  Components: ${currentConfig.paths.components}`)
      );
      console.log(chalk.gray(`  Hooks: ${currentConfig.paths.hooks}`));
      console.log(chalk.gray(`  Utils: ${currentConfig.paths.utils}`));
    } else {
      console.log(chalk.red("⚠️ Existing configuration file is corrupted"));
    }
  } catch (error) {
    console.log(chalk.red("⚠️ Could not read existing configuration"));
  }

  const { shouldReinitialize } = await inquirer.prompt([
    {
      type: "confirm",
      name: "shouldReinitialize",
      message: "Do you want to force reinitialize Verza UI configuration?",
      default: false,
    },
  ]);

  if (!shouldReinitialize) {
    console.log(chalk.green("✅ Keeping existing configuration"));
    return true;
  }

  console.log(chalk.yellow("⚠️  Reinitializing configuration..."));
  return false;
}

/**
 * Create path validator function
 */
function createPathValidator(pathType: PathType) {
  return (input: string) => validatePathInput(input, pathType);
}

/**
 * Get path configuration
 */
export async function getPathConfiguration(): Promise<PathConfiguration> {
  const { customizePaths } = await inquirer.prompt([
    {
      type: "confirm",
      name: "customizePaths",
      message: "Do you want to customize the component paths?",
      default: false,
    },
  ]);

  if (!customizePaths) {
    return {
      components: DEFAULT_PATHS.components,
      hooks: DEFAULT_PATHS.hooks,
      utils: DEFAULT_PATHS.utils,
    };
  }

  const pathAnswers = await inquirer.prompt([
    {
      type: "input",
      name: "components",
      message: "Components path:",
      default: DEFAULT_PATHS.components,
      validate: createPathValidator("components"),
    },
    {
      type: "input",
      name: "hooks",
      message: "Hooks path:",
      default: DEFAULT_PATHS.hooks,
      validate: createPathValidator("hooks"),
    },
    {
      type: "input",
      name: "utils",
      message: "Utils path:",
      default: DEFAULT_PATHS.utils,
      validate: createPathValidator("utils"),
    },
  ]);

  return {
    components: pathAnswers.components.trim(),
    hooks: pathAnswers.hooks.trim(),
    utils: pathAnswers.utils.trim(),
  };
}

/**
 * Display configuration information
 */
export function displayConfiguration(
  useTypeScript: boolean,
  paths: PathConfiguration
): void {
  console.log(chalk.cyan("\n📁 Configuration created:"));
  console.log(chalk.gray(`  • TypeScript: ${useTypeScript ? "Yes" : "No"}`));
  console.log(chalk.gray(`  • Components: ${paths.components}`));
  console.log(chalk.gray(`  • Hooks: ${paths.hooks}`));
  console.log(chalk.gray(`  • Utils: ${paths.utils}`));
  console.log();
}

/**
 * Create Verza configuration file
 */
export function createVerzaConfig(paths: PathConfiguration): VerzaConfig {
  const useTypeScript = isUsingTypeScript();

  const verzaConfig: VerzaConfig = {
    typescript: useTypeScript,
    paths,
  };

  const success = writeJsonFile(CONFIG_FILE_NAME, verzaConfig);

  if (!success) {
    console.log(chalk.red("❌ Failed to create configuration file"));
    process.exit(1);
  }

  displayConfiguration(useTypeScript, paths);
  return verzaConfig;
}
