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
  // Handle list command
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

    // 驗證組件是否存在
    const isValidComponent = await validateComponent(target);
    if (!isValidComponent) {
      console.error(chalk.red(`❌ Component "${target}" not found.`));
      console.log(
        chalk.gray("Run `npx verza-ui add list` to see available components.")
      );
      process.exit(1);
    }

    // 獲取組件信息
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

    // 檢查配置
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

    // 準備下載路徑
    const hasSrcFolder =
      verzaConfig.paths.components.includes("src/") ||
      fs.existsSync(path.join(process.cwd(), "src"));

    // 將 @/ 轉換為實際路徑
    let actualComponentPath = verzaConfig.paths.components;
    if (actualComponentPath.startsWith("@/")) {
      const relativePath = actualComponentPath.replace("@/", "");
      actualComponentPath = hasSrcFolder ? `src/${relativePath}` : relativePath;
    }

    const baseComponentPath = path.join(process.cwd(), actualComponentPath);

    await fs.ensureDir(baseComponentPath);

    console.log(chalk.cyan("📥 Downloading component files..."));

    // 下載所有相關文件
    const downloadPromises = componentInfo.files.map(async (fileName) => {
      // fileName 已經包含完整路徑，如 "components/button/Button.tsx"
      const pathParts = fileName.split("/");
      const actualFileName = pathParts[pathParts.length - 1]; // 取得檔案名稱

      const adjustedFileName = actualFileName.replace(
        /\.tsx?$/,
        `.${language === "ts" ? "tsx" : "jsx"}`
      );

      // 構建正確的 repo URL
      const repoUrl = `${REPO_BASE_URL}/${fileName.replace(
        /\.tsx?$/,
        `.${language === "ts" ? "tsx" : "jsx"}`
      )}`;
      const outputPath = path.join(baseComponentPath, adjustedFileName);

      console.log(chalk.gray(`  - Downloading ${adjustedFileName}...`));
      await downloadFile(repoUrl, outputPath);

      return outputPath;
    });

    const downloadedFiles = await Promise.all(downloadPromises);

    // 安裝外部依賴
    if (componentInfo.dependencies.external.length > 0) {
      console.log(chalk.cyan("📦 Installing dependencies..."));
      console.log(
        chalk.gray(
          `  Dependencies: ${componentInfo.dependencies.external.join(", ")}`
        )
      );
      await installPackages(componentInfo.dependencies.external);
    }

    // 檢查內部依賴
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

    // 顯示使用示例
    console.log(chalk.cyan("\n📖 Usage:"));
    console.log(
      chalk.gray(
        `import { ${componentInfo.name} } from '@/components/verza-ui/${componentInfo.name}';`
      )
    );
  } catch (error) {
    console.error(chalk.red(`❌ Failed to add component: ${error}`));
    process.exit(1);
  }
}
