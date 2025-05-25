import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { REPO_BASE_URL } from "../config";
import { downloadFile, loadVerzaConfig, installPackages } from "../utils";
import {
  fetchComponentInfo,
  validateComponent,
  listAvailableComponents,
} from "../utils/registryApi";

export async function addComponent(target: string) {
  if (target === "list" || target === "--list" || target === "-l") {
    await listAvailableComponents();
    return;
  }

  if (!target) {
    console.error(chalk.red("❌ Please provide a component name."));
    console.log(chalk.gray("Usage: npx verza-ui add <component-name>"));
    console.log(chalk.gray("       npx verza-ui add list"));
    process.exit(1);
  }

  try {
    console.log(chalk.cyan(`🔍 Looking for component "${target}"...`));

    const isValidComponent = await validateComponent(target);
    if (!isValidComponent) {
      console.error(chalk.red(`❌ Component "${target}" not found.`));
      console.log(
        chalk.gray("Run `npx verza-ui add list` to see available components.")
      );
      process.exit(1);
    }

    const componentInfo = await fetchComponentInfo(target);
    if (!componentInfo) {
      console.error(
        chalk.red(`❌ Failed to fetch component info for "${target}".`)
      );
      process.exit(1);
    }

    console.log(chalk.green(`✅ Found component: ${componentInfo.name}`));
    if (componentInfo.description) {
      console.log(chalk.gray(`   ${componentInfo.description}`));
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
    const language = isTypeScriptProject ? "ts" : "js";

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

    console.log(chalk.cyan("📥 Downloading component files..."));

    const downloadPromises = componentInfo.files.map(async (fileName) => {
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

    if (componentInfo.dependencies.external.length > 0) {
      console.log(chalk.cyan("📦 Installing dependencies..."));
      console.log(
        chalk.gray(
          `  Dependencies: ${componentInfo.dependencies.external.join(", ")}`
        )
      );
      await installPackages(componentInfo.dependencies.external);
    }

    if (componentInfo.dependencies.internal.length > 0) {
      console.log(chalk.yellow("⚠️  Internal dependencies required:"));
      componentInfo.dependencies.internal.forEach((dep) => {
        console.log(chalk.gray(`  - ${dep}`));
      });
      console.log(
        chalk.gray("Make sure these utilities are available in your project.")
      );
    }

    console.log(chalk.green(`🎉 Component "${target}" added successfully!`));
    console.log(chalk.gray("Files added:"));
    downloadedFiles.forEach((file) => {
      console.log(chalk.gray(`  - ${path.relative(process.cwd(), file)}`));
    });
  } catch (error) {
    console.error(chalk.red(`❌ Failed to add component: ${error}`));
    process.exit(1);
  }
}
