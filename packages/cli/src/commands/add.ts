import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import axios from "axios";
import { REPO_BASE_URL } from "../config";
import { loadVerzaConfig, installPackages, convertTsToJs } from "../utils";
import {
  fetchModuleInfo,
  validateModule,
  listAvailableModules,
} from "../utils/registryClient";

// Track processed modules to avoid circular dependencies
const processedModules = new Set<string>();

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

  if (basePath.startsWith("@/")) {
    const relativePath = basePath.replace("@/", "");
    basePath = hasSrcFolder ? `src/${relativePath}` : relativePath;
  }

  return path.join(process.cwd(), basePath);
}

async function updateImportPaths(
  filePath: string,
  verzaConfig: any
): Promise<void> {
  try {
    const ext = path.extname(filePath);
    if (![".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
      return;
    }

    const content = await fs.readFile(filePath, "utf-8");
    let updatedContent = content;

    const pathMappings = {
      "@/components/verza-ui": verzaConfig.paths.components,
      "@/hooks/verza-ui": verzaConfig.paths.hooks,
      "@/utils": verzaConfig.paths.utils,
    };

    // Replace import paths
    for (const [registryPath, userPath] of Object.entries(pathMappings)) {
      if (registryPath !== userPath) {
        const escapedRegistryPath = registryPath.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        const patterns = [
          {
            pattern: new RegExp(`(["'])${escapedRegistryPath}(["'])`, "g"),
            replacement: `$1${userPath}$2`,
          },
          {
            pattern: new RegExp(
              `(["'])${escapedRegistryPath}(/[^"']*)(["'])`,
              "g"
            ),
            replacement: `$1${userPath}$2$3`,
          },
        ];

        for (const { pattern, replacement } of patterns) {
          updatedContent = updatedContent.replace(pattern, replacement);
        }
      }
    }

    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent);
    }
  } catch (error) {}
}

function generateImportExample(moduleInfo: any, verzaConfig: any): string {
  switch (moduleInfo.category) {
    case "components":
      const componentPath = verzaConfig.paths.components;
      return `import { ${moduleInfo.name} } from "${componentPath}/${moduleInfo.name}";`;

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

async function downloadAndProcessFile(
  fileName: string,
  outputPath: string,
  isTypeScriptProject: boolean
): Promise<void> {
  try {
    const fileUrl = `${REPO_BASE_URL}/${fileName}`;
    const response = await axios.get(fileUrl, {
      responseType: "text",
      timeout: 10000,
    });

    let content = response.data;

    if (
      !isTypeScriptProject &&
      (fileName.endsWith(".ts") || fileName.endsWith(".tsx"))
    ) {
      content = convertTsToJs(content, fileName);
    }

    await fs.ensureDir(path.dirname(outputPath));

    await fs.writeFile(outputPath, content, "utf-8");
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error(`File not found: ${fileName}`);
    }
    throw error;
  }
}

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
    return {
      externalDependencies: [],
      internalDependencies: [],
      downloadedFiles: [],
    };
  }

  moduleInfo.dependencies.external.forEach((dep) => allExternalDeps.add(dep));

  moduleInfo.dependencies.internal.forEach((dep) => allInternalDeps.add(dep));

  const moduleBasePath = getModuleDownloadPath(
    moduleInfo,
    verzaConfig,
    hasSrcFolder
  );
  await fs.ensureDir(moduleBasePath);

  const downloadPromises = moduleInfo.files.map(async (fileName: string) => {
    const pathParts = fileName.split("/");
    const actualFileName = pathParts[pathParts.length - 1];

    let finalFileName = actualFileName;
    if (!isTypeScriptProject) {
      finalFileName = actualFileName
        .replace(/\.tsx$/, ".jsx")
        .replace(/\.ts$/, ".js");
    } else if (actualFileName.endsWith(".jsx")) {
      finalFileName = actualFileName.replace(/\.jsx$/, ".tsx");
    }

    const outputPath = path.join(moduleBasePath, finalFileName);

    if (await fs.pathExists(outputPath)) {
      return outputPath;
    }

    await downloadAndProcessFile(fileName, outputPath, isTypeScriptProject);

    await updateImportPaths(outputPath, verzaConfig);

    return outputPath;
  });

  const currentDownloadedFiles = await Promise.all(downloadPromises);

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
    processedModules.clear();

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
      console.error(chalk.red(`❌ Failed to fetch "${target}".`));
      process.exit(1);
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

    console.log(chalk.cyan(`📦 Adding ${moduleInfo.name}...`));

    const resolvedDependencies = await resolveDependencies(
      target,
      verzaConfig,
      hasSrcFolder,
      isTypeScriptProject
    );

    if (resolvedDependencies.externalDependencies.length > 0) {
      await installPackages(resolvedDependencies.externalDependencies);
    }

    console.log(chalk.green(`🎉 ${moduleInfo.name} added successfully!`));
    console.log();

    const uniqueFiles = [...new Set(resolvedDependencies.downloadedFiles)];
    if (uniqueFiles.length > 0) {
      console.log(chalk.gray("Files:"));
      uniqueFiles.forEach((file: string) => {
        console.log(chalk.gray(`  ${path.relative(process.cwd(), file)}`));
      });
    }

    console.log(chalk.cyan("\n💡 Usage:"));
    console.log(
      chalk.gray(`  ${generateImportExample(moduleInfo, verzaConfig)}`)
    );
  } catch (error) {
    console.error(chalk.red(`❌ Failed to add ${target}`));
    if (error instanceof Error && error.message) {
      console.log(chalk.gray(`   ${error.message}`));
    }
    process.exit(1);
  }
}
