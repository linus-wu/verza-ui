import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { VerzaConfig } from "../types";
import { CONFIG_FILE_NAME, REPO_BASE_URL } from "../config";
import {
  checkFileExists,
  detectFrameworkType,
  downloadFile,
  hasSrcDirectory,
  installPackages,
  isUsingTypeScript,
  writeJsonFile,
} from "../utils";
import { setupPathAliases } from "../utils/pathAliases";
import {
  hasTailwindInstalled,
  hasTailwindPrettierSetup,
  setupTailwind,
  setupTailwindPrettier,
} from "../utils/tailwind";

const PACKAGES = ["clsx", "tailwind-merge"];

export async function initializeVerza() {
  const configPath = CONFIG_FILE_NAME;

  if (checkFileExists(configPath)) {
    console.log(chalk.bgCyanBright("Project has already been initialized."));
    return;
  }

  console.log(chalk.cyan("✨ Welcome to Verza UI ✨"));

  if (!checkFileExists("package.json")) {
    console.log(
      chalk.red("❌ No package.json found. Please run `npm init -y` first.")
    );
    process.exit(1);
  }

  const hasTailwind = hasTailwindInstalled();
  let shouldSetupTailwind = false;

  if (!hasTailwind) {
    const { setupTailwind } = await inquirer.prompt([
      {
        type: "confirm",
        name: "setupTailwind",
        message: "Tailwind CSS is not installed. Do you want to set it up?",
        default: true,
      },
    ]);
    shouldSetupTailwind = setupTailwind;
  } else {
    console.log(chalk.blue("ℹ️ Tailwind CSS is already installed."));
  }

  const hasTailwindPrettier = hasTailwindPrettierSetup();
  let shouldSetupTailwindPrettier = false;

  if (!hasTailwindPrettier) {
    const { useTailwindPrettier } = await inquirer.prompt([
      {
        type: "confirm",
        name: "useTailwindPrettier",
        message: "Do you want to setup Tailwind CSS Prettier?",
        default: true,
      },
    ]);
    shouldSetupTailwindPrettier = useTailwindPrettier;
  } else {
    console.log(chalk.blue("ℹ️ Tailwind CSS Prettier is already configured."));
  }

  await setupPathAliases();

  const useTypeScript = isUsingTypeScript();

  const componentPath = "@/components/verza-ui";
  const utilsPath = "@/utils";

  const verzaConfig: VerzaConfig = {
    typescript: useTypeScript,
    paths: { components: componentPath, utils: utilsPath },
    themeColors: {
      primary: [54, 111, 87],
      secondary: [89, 197, 156],
      accent: [243, 196, 77],
      warning: [247, 169, 70],
      error: [228, 81, 65],
    },
  };
  writeJsonFile(configPath, verzaConfig);

  if (shouldSetupTailwind) {
    const frameworkType = detectFrameworkType();
    await setupTailwind(frameworkType);
  }

  await installPackages(PACKAGES);

  if (shouldSetupTailwindPrettier) {
    await setupTailwindPrettier();
  }

  const hasSrcFolder = hasSrcDirectory();
  const actualUtilsPath = hasSrcFolder ? "src/utils/" : "utils/";
  const utilsDirPath = path.join(process.cwd(), actualUtilsPath);
  await fs.ensureDir(utilsDirPath);

  const fileExtension = useTypeScript ? "ts" : "js";
  const cnFilePath = path.join(utilsDirPath, `cn.${fileExtension}`);

  if (!checkFileExists(cnFilePath)) {
    const cnFileUrl = `${REPO_BASE_URL}/utils/cn/cn.${fileExtension}`;
    try {
      await downloadFile(cnFileUrl, cnFilePath);
    } catch (error) {
      console.log(
        chalk.red(
          `⚠️ Failed to download ${cnFileUrl}, you may need to manually add cn.${fileExtension}.`
        )
      );
    }
  }

  console.log(chalk.greenBright("🎉 Verza UI initialized successfully!"));
}
