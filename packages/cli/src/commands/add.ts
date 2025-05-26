import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { REPO_BASE_URL } from "../config";
import { downloadFile, loadVerzaConfig, installPackages } from "../utils";
import {
  fetchItemInfo,
  validateItem,
  listAvailableItems,
} from "../utils/registryApi";

export async function addItem(target: string) {
  if (target === "list" || target === "--list" || target === "-l") {
    await listAvailableItems();
    return;
  }

  if (!target) {
    console.error(
      chalk.red("❌ Please provide a component, hook, or utility name.")
    );
    console.log(chalk.gray("Usage: npx verza-ui add <name>"));
    console.log(chalk.gray("       npx verza-ui add list"));
    process.exit(1);
  }

  try {
    console.log(chalk.cyan(`🔍 Looking for "${target}"...`));

    const isValidItem = await validateItem(target);
    if (!isValidItem) {
      console.error(chalk.red(`❌ "${target}" not found.`));
      console.log(
        chalk.gray(
          "Run `npx verza-ui add list` to see available components, hooks, and utilities."
        )
      );
      process.exit(1);
    }

    const itemInfo = await fetchItemInfo(target);
    if (!itemInfo) {
      console.error(chalk.red(`❌ Failed to fetch info for "${target}".`));
      process.exit(1);
    }

    console.log(chalk.green(`✅ Found ${itemInfo.category}: ${itemInfo.name}`));
    if (itemInfo.description) {
      console.log(chalk.gray(`   ${itemInfo.description}`));
    }

    const verzaConfig = loadVerzaConfig();
    if (!verzaConfig) {
      console.error(
        chalk.red(
          "❌ Verza config not found. Please run `npx verza-ui init` first."
        )
      );
      process.exit(1);
    }

    const isTypeScriptProject = verzaConfig.typescript;

    const hasSrcFolder =
      verzaConfig.paths.components.includes("src/") ||
      fs.existsSync(path.join(process.cwd(), "src"));

    let actualComponentPath = verzaConfig.paths.components;
    if (actualComponentPath.startsWith("@/")) {
      const relativePath = actualComponentPath.replace("@/", "");
      actualComponentPath = hasSrcFolder ? `src/${relativePath}` : relativePath;
    }

    const baseComponentPath = path.join(process.cwd(), actualComponentPath);

    await fs.ensureDir(baseComponentPath);

    console.log(chalk.cyan("📥 Downloading files..."));

    const downloadPromises = itemInfo.files.map(async (fileName: string) => {
      const pathParts = fileName.split("/");
      const actualFileName = pathParts[pathParts.length - 1];

      let adjustedFileName = actualFileName;
      if (!isTypeScriptProject) {
        adjustedFileName = actualFileName
          .replace(/\.tsx$/, ".jsx")
          .replace(/\.ts$/, ".js");
      } else if (actualFileName.endsWith(".jsx")) {
        adjustedFileName = actualFileName.replace(/\.jsx$/, ".tsx");
      }

      const repoUrl = `${REPO_BASE_URL}/${fileName}`;
      const outputPath = path.join(baseComponentPath, adjustedFileName);

      console.log(chalk.gray(`  - Downloading ${adjustedFileName}...`));
      await downloadFile(repoUrl, outputPath);

      return outputPath;
    });

    const downloadedFiles = await Promise.all(downloadPromises);

    if (itemInfo.dependencies.external.length > 0) {
      console.log(chalk.cyan("📦 Installing dependencies..."));
      console.log(
        chalk.gray(
          `  Dependencies: ${itemInfo.dependencies.external.join(", ")}`
        )
      );
      await installPackages(itemInfo.dependencies.external);
    }

    if (itemInfo.dependencies.internal.length > 0) {
      console.log(chalk.yellow("⚠️  Internal dependencies required:"));
      itemInfo.dependencies.internal.forEach((dep: string) => {
        console.log(chalk.gray(`  - ${dep}`));
      });
      console.log(
        chalk.gray("Make sure these utilities are available in your project.")
      );
    }

    console.log(
      chalk.green(
        `🎉 ${
          itemInfo.category.charAt(0).toUpperCase() +
          itemInfo.category.slice(0, -1)
        } "${target}" added successfully!`
      )
    );
    console.log(chalk.gray("Files added:"));
    downloadedFiles.forEach((file: string) => {
      console.log(chalk.gray(`  - ${path.relative(process.cwd(), file)}`));
    });
  } catch (error) {
    console.error(chalk.red(`❌ Failed to add: ${error}`));
    process.exit(1);
  }
}
