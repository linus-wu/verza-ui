import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { REPO_BASE_URL } from "../config";
import { downloadFile, loadVerzaConfig, installPackages } from "../utils";
import {
  fetchModuleInfo,
  validateModule,
  listAvailableModules,
} from "../utils/registryClient";

// 用於追蹤已處理的模組，避免循環依賴
const processedModules = new Set<string>();

/**
 * 根據模組類型和配置獲取正確的下載路徑
 */
function getModuleDownloadPath(
  moduleInfo: any,
  verzaConfig: any,
  hasSrcFolder: boolean
): string {
  let basePath: string;

  switch (moduleInfo.category) {
    case "components":
      basePath = verzaConfig.paths.components;
      break;
    case "hooks":
      basePath = verzaConfig.paths.hooks;
      break;
    case "utils":
      basePath = verzaConfig.paths.utils;
      break;
    default:
      basePath = verzaConfig.paths.components;
  }

  // 處理 @/ 別名
  if (basePath.startsWith("@/")) {
    const relativePath = basePath.replace("@/", "");
    basePath = hasSrcFolder ? `src/${relativePath}` : relativePath;
  }

  return path.join(process.cwd(), basePath);
}

/**
 * 生成正確的導入路徑提示
 */
function generateImportExample(
  moduleInfo: any,
  target: string,
  verzaConfig: any
): string {
  switch (moduleInfo.category) {
    case "components":
      const componentPath = verzaConfig.paths.components;
      return `import { ${
        moduleInfo.name
      } } from "${componentPath}/${target.toLowerCase()}/${moduleInfo.name}";`;

    case "hooks":
      const hooksPath = verzaConfig.paths.hooks;
      return `import ${moduleInfo.name} from "${hooksPath}/${moduleInfo.name}";`;

    case "utils":
      const utilsPath = verzaConfig.paths.utils;
      return `import { ${moduleInfo.name} } from "${utilsPath}/${moduleInfo.name}";`;

    default:
      return `// Import path depends on your configuration`;
  }
}

/**
 * 遞歸解析並安裝模組的所有依賴
 */
async function resolveDependencies(
  moduleName: string,
  verzaConfig: any,
  hasSrcFolder: boolean,
  isTypeScriptProject: boolean,
  allExternalDeps: Set<string> = new Set(),
  allInternalDeps: Set<string> = new Set()
): Promise<{
  externalDependencies: string[];
  internalDependencies: string[];
  downloadedFiles: string[];
}> {
  // 避免重複處理同一個模組
  if (processedModules.has(moduleName)) {
    return {
      externalDependencies: [],
      internalDependencies: [],
      downloadedFiles: [],
    };
  }

  processedModules.add(moduleName);

  const moduleInfo = await fetchModuleInfo(moduleName);
  if (!moduleInfo) {
    console.warn(chalk.yellow(`⚠️  Could not find dependency: ${moduleName}`));
    return {
      externalDependencies: [],
      internalDependencies: [],
      downloadedFiles: [],
    };
  }

  console.log(
    chalk.gray(`  📦 Processing ${moduleInfo.category}: ${moduleName}`)
  );

  // 收集外部依賴
  moduleInfo.dependencies.external.forEach((dep) => allExternalDeps.add(dep));

  // 收集內部依賴
  moduleInfo.dependencies.internal.forEach((dep) => allInternalDeps.add(dep));

  // 獲取當前模組的正確下載路徑
  const moduleBasePath = getModuleDownloadPath(
    moduleInfo,
    verzaConfig,
    hasSrcFolder
  );
  await fs.ensureDir(moduleBasePath);

  // 下載當前模組的文件
  const downloadPromises = moduleInfo.files.map(async (fileName: string) => {
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

    // 對於組件，保持子目錄結構；對於 utils 和 hooks，直接放在根目錄
    let outputPath: string;
    if (moduleInfo.category === "components") {
      // 為組件創建子目錄 (例如: components/verza-ui/button/Button.tsx)
      const componentSubDir = path.join(
        moduleBasePath,
        moduleName.toLowerCase()
      );
      await fs.ensureDir(componentSubDir);
      outputPath = path.join(componentSubDir, adjustedFileName);
    } else {
      // utils 和 hooks 直接放在對應目錄下
      outputPath = path.join(moduleBasePath, adjustedFileName);
    }

    // 檢查文件是否已存在
    if (await fs.pathExists(outputPath)) {
      console.log(chalk.gray(`    ✓ ${adjustedFileName} already exists`));
      return outputPath;
    }

    console.log(chalk.gray(`    - Downloading ${adjustedFileName}...`));
    await downloadFile(repoUrl, outputPath);
    return outputPath;
  });

  const currentDownloadedFiles = await Promise.all(downloadPromises);

  // 遞歸處理內部依賴
  const allDownloadedFiles = [...currentDownloadedFiles];

  for (const internalDep of moduleInfo.dependencies.internal) {
    const depResult = await resolveDependencies(
      internalDep,
      verzaConfig,
      hasSrcFolder,
      isTypeScriptProject,
      allExternalDeps,
      allInternalDeps
    );
    allDownloadedFiles.push(...depResult.downloadedFiles);
  }

  return {
    externalDependencies: Array.from(allExternalDeps),
    internalDependencies: Array.from(allInternalDeps),
    downloadedFiles: allDownloadedFiles,
  };
}

export async function addModule(
  target: string,
  flags: Record<string, boolean> = {}
) {
  if (
    target === "list" ||
    target === "--list" ||
    target === "-l" ||
    flags.list
  ) {
    await listAvailableModules();
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
    // 重置已處理模組的追蹤
    processedModules.clear();

    console.log(chalk.cyan(`🔍 Looking for "${target}"...`));

    const isValidModule = await validateModule(target);
    if (!isValidModule) {
      console.error(chalk.red(`❌ "${target}" not found.`));
      console.log(
        chalk.gray(
          "Run `npx verza-ui add list` to see available components, hooks, and utilities."
        )
      );
      process.exit(1);
    }

    const moduleInfo = await fetchModuleInfo(target);
    if (!moduleInfo) {
      console.error(chalk.red(`❌ Failed to fetch info for "${target}".`));
      process.exit(1);
    }

    console.log(
      chalk.green(`✅ Found ${moduleInfo.category}: ${moduleInfo.name}`)
    );
    if (moduleInfo.description) {
      console.log(chalk.gray(`   ${moduleInfo.description}`));
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

    console.log(
      chalk.cyan("📥 Resolving dependencies and downloading files...")
    );

    // 遞歸解析所有依賴
    const resolvedDependencies = await resolveDependencies(
      target,
      verzaConfig,
      hasSrcFolder,
      isTypeScriptProject
    );

    // 安裝外部依賴
    if (resolvedDependencies.externalDependencies.length > 0) {
      console.log(chalk.cyan("📦 Installing external dependencies..."));
      console.log(
        chalk.gray(
          `  Dependencies: ${resolvedDependencies.externalDependencies.join(
            ", "
          )}`
        )
      );
      await installPackages(resolvedDependencies.externalDependencies);
    }

    // 顯示內部依賴信息
    if (resolvedDependencies.internalDependencies.length > 0) {
      console.log(chalk.green("✅ Internal dependencies resolved:"));
      resolvedDependencies.internalDependencies.forEach((dep: string) => {
        console.log(chalk.gray(`  ✓ ${dep}`));
      });
    }

    console.log(
      chalk.green(
        `🎉 ${
          moduleInfo.category.charAt(0).toUpperCase() +
          moduleInfo.category.slice(0, -1)
        } "${target}" added successfully!`
      )
    );

    console.log(chalk.gray("Files added:"));
    // 去重並顯示所有下載的文件
    const uniqueFiles = [...new Set(resolvedDependencies.downloadedFiles)];
    uniqueFiles.forEach((file: string) => {
      console.log(chalk.gray(`  - ${path.relative(process.cwd(), file)}`));
    });

    // 顯示依賴摘要
    if (
      resolvedDependencies.externalDependencies.length > 0 ||
      resolvedDependencies.internalDependencies.length > 0
    ) {
      console.log(chalk.cyan("\n📋 Dependency Summary:"));
      if (resolvedDependencies.externalDependencies.length > 0) {
        console.log(
          chalk.gray(
            `  External: ${resolvedDependencies.externalDependencies.length} packages installed`
          )
        );
      }
      if (resolvedDependencies.internalDependencies.length > 0) {
        console.log(
          chalk.gray(
            `  Internal: ${resolvedDependencies.internalDependencies.length} utilities included`
          )
        );
      }
    }

    // 顯示使用提示
    console.log(chalk.cyan("\n💡 Usage:"));
    console.log(
      chalk.gray(`  ${generateImportExample(moduleInfo, target, verzaConfig)}`)
    );
  } catch (error) {
    console.error(chalk.red(`❌ Failed to add: ${error}`));
    process.exit(1);
  }
}
