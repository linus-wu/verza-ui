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
  loadVerzaConfig,
} from "../utils";
import { setupPathAliases } from "../utils/pathAliases";
import {
  hasTailwindInstalled,
  hasTailwindPrettierSetup,
  setupTailwind,
  setupTailwindPrettier,
  getTailwindVersion,
  isTailwindV4OrLater,
  setupTailwindCustomStyles,
} from "../utils/tailwind";

const PACKAGES = ["clsx", "tailwind-merge"];

export async function initializeVerza(flags: Record<string, boolean> = {}) {
  const configPath = CONFIG_FILE_NAME;
  const forceInit = flags.force;

  if (checkFileExists(configPath) && !forceInit) {
    console.log(chalk.cyan("✨ Verza UI configuration file already exists"));

    // Display current configuration
    const currentConfig = loadVerzaConfig();
    if (currentConfig) {
      console.log(chalk.gray("\nCurrent configuration:"));
      console.log(
        chalk.gray(`  TypeScript: ${currentConfig.typescript ? "Yes" : "No"}`)
      );
      console.log(
        chalk.gray(`  Components path: ${currentConfig.paths.components}`)
      );
      console.log(chalk.gray(`  Hooks path: ${currentConfig.paths.hooks}`));
      console.log(chalk.gray(`  Utils path: ${currentConfig.paths.utils}`));
    }

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          { name: "Keep existing configuration (exit)", value: "keep" },
          { name: "Overwrite existing configuration", value: "overwrite" },
        ],
        default: "keep",
      },
    ]);

    switch (action) {
      case "keep":
        console.log(chalk.green("✅ Keeping existing configuration"));
        return;
      case "overwrite":
        console.log(chalk.yellow("⚠️  Overwriting existing configuration..."));
        break;
    }
  } else if (forceInit && checkFileExists(configPath)) {
    console.log(
      chalk.yellow(
        "⚠️  Using --force option, overwriting existing configuration..."
      )
    );
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
  let shouldSetupCustomStyles = false;

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
    const version = getTailwindVersion();
    const isV4 = isTailwindV4OrLater();

    console.log(
      chalk.blue(`ℹ️ Tailwind CSS v${version} is already installed.`)
    );
    console.log(chalk.gray(`   Version: ${isV4 ? "v4+" : "v3"} detected`));

    const { setupCustomStyles } = await inquirer.prompt([
      {
        type: "confirm",
        name: "setupCustomStyles",
        message:
          "Do you want to setup Verza UI custom color styles for Tailwind?",
        default: true,
      },
    ]);
    shouldSetupCustomStyles = setupCustomStyles;
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

  // 讓用戶選擇是否自定義路徑
  const { customizePaths } = await inquirer.prompt([
    {
      type: "confirm",
      name: "customizePaths",
      message: "Do you want to customize the component paths?",
      default: false,
    },
  ]);

  let componentPath = "@/components/verza-ui";
  let hooksPath = "@/hooks/verza-ui";
  let utilsPath = "@/utils";

  if (customizePaths) {
    const pathAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "componentPath",
        message: "Components path:",
        default: "@/components/verza-ui",
        validate: (input) => input.trim().length > 0 || "Path cannot be empty",
      },
      {
        type: "input",
        name: "hooksPath",
        message: "Hooks path:",
        default: "@/hooks/verza-ui",
        validate: (input) => input.trim().length > 0 || "Path cannot be empty",
      },
      {
        type: "input",
        name: "utilsPath",
        message: "Utils path:",
        default: "@/utils",
        validate: (input) => input.trim().length > 0 || "Path cannot be empty",
      },
    ]);

    componentPath = pathAnswers.componentPath;
    hooksPath = pathAnswers.hooksPath;
    utilsPath = pathAnswers.utilsPath;
  }

  const verzaConfig: VerzaConfig = {
    typescript: useTypeScript,
    paths: { components: componentPath, hooks: hooksPath, utils: utilsPath },
  };
  writeJsonFile(configPath, verzaConfig);

  console.log(chalk.blue("\n📁 Configuration:"));
  console.log(chalk.gray(`  TypeScript: ${useTypeScript ? "Yes" : "No"}`));
  console.log(chalk.gray(`  Components: ${componentPath}`));
  console.log(chalk.gray(`  Hooks: ${hooksPath}`));
  console.log(chalk.gray(`  Utils: ${utilsPath}`));

  if (shouldSetupTailwind) {
    const frameworkType = detectFrameworkType();
    await setupTailwind(frameworkType);
  }

  if (shouldSetupCustomStyles) {
    await setupTailwindCustomStyles();
  }

  await installPackages(PACKAGES);

  if (shouldSetupTailwindPrettier) {
    await setupTailwindPrettier();
  }

  const hasSrcFolder = hasSrcDirectory();

  // 使用配置中的 utils 路徑，而不是硬編碼
  let actualUtilsPath = verzaConfig.paths.utils;
  if (actualUtilsPath.startsWith("@/")) {
    const relativePath = actualUtilsPath.replace("@/", "");
    actualUtilsPath = hasSrcFolder ? `src/${relativePath}` : relativePath;
  }

  const utilsDirPath = path.join(process.cwd(), actualUtilsPath);
  await fs.ensureDir(utilsDirPath);

  const fileExtension = useTypeScript ? "ts" : "js";
  const cnFilePath = path.join(utilsDirPath, `cn.${fileExtension}`);

  if (!checkFileExists(cnFilePath)) {
    console.log(chalk.cyan("📥 Downloading cn utility..."));
    const cnFileUrl = `${REPO_BASE_URL}/utils/cn/cn.${fileExtension}`;
    try {
      await downloadFile(cnFileUrl, cnFilePath);
      console.log(chalk.green("✅ cn utility added successfully!"));
    } catch (error) {
      console.log(
        chalk.yellow(
          `⚠️ Failed to download cn utility. You can add it later using: npx verza-ui add cn`
        )
      );
    }
  } else {
    console.log(chalk.blue("ℹ️ cn utility already exists"));
  }

  console.log(chalk.greenBright("🎉 Verza UI initialized successfully!"));

  // 顯示下一步提示
  console.log(chalk.cyan("\n💡 Next steps:"));
  console.log(chalk.gray("  • Add components: npx verza-ui add button"));
  console.log(chalk.gray("  • List available modules: npx verza-ui add list"));
  console.log(chalk.gray("  • Check documentation for usage examples"));
}
