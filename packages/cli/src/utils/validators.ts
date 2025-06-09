import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { checkFileExists } from ".";

// Type definitions
export interface ProjectConfig {
  paths: {
    components: string;
    hooks: string;
    utils: string;
  };
}

export interface DirectoryWarning {
  type: string;
  path: string;
  files: string[];
}

export type PathType = "components" | "hooks" | "utils";

export async function validateProjectEnvironment(): Promise<void> {
  // Check package.json
  if (!checkFileExists("package.json")) {
    console.log(
      chalk.red("❌ No package.json found. Please run `npm init -y` first.")
    );
    process.exit(1);
  }

  // Node.js version check
  try {
    const nodeVersion = process.version;
    const versionMatch = nodeVersion.match(/^v(\d+)\.(\d+)\.(\d+)/);

    if (!versionMatch) {
      throw new Error("Cannot parse Node.js version");
    }

    const majorVersion = parseInt(versionMatch[1], 10);
    const minVersion = 16;

    if (majorVersion < minVersion) {
      console.log(
        chalk.red(`❌ Node.js version ${nodeVersion} is not supported.`)
      );
      console.log(
        chalk.gray(`   Minimum required version: Node.js ${minVersion}.x`)
      );
      process.exit(1);
    }
  } catch (error) {
    console.log(chalk.red("❌ Unable to detect Node.js version."));
    process.exit(1);
  }

  // Check write permissions
  try {
    const testFile = path.join(process.cwd(), ".verza-test-write");
    await fs.writeFile(testFile, "test");
    await fs.remove(testFile);
  } catch (error) {
    console.log(chalk.red("❌ No write permission in current directory."));
    process.exit(1);
  }
}

export function validatePathInput(
  input: string,
  pathType?: PathType
): boolean | string {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return `${
      pathType ? pathType.charAt(0).toUpperCase() + pathType.slice(1) : "Path"
    } cannot be empty`;
  }

  // Normalize path separators
  const normalizedPath = trimmed.replace(/\\/g, "/");

  // Check for dangerous parent directory references
  if (normalizedPath.includes("../")) {
    return "Parent directory references (..) are not allowed";
  }

  // Check for absolute paths
  if (path.isAbsolute(normalizedPath)) {
    return "Absolute paths are not recommended, use relative paths instead";
  }

  // Platform-specific unsafe character checks
  const unsafeChars =
    process.platform === "win32" ? /[<>:"|?*\x00-\x1f]/ : /[<>"|*\x00-\x1f]/;

  if (unsafeChars.test(trimmed)) {
    return "Path contains invalid characters";
  }

  // Windows path length check
  if (process.platform === "win32" && normalizedPath.length > 248) {
    return "Path is too long for Windows filesystem";
  }

  // Check if path starts or ends with spaces
  if (normalizedPath.startsWith(" ") || normalizedPath.endsWith(" ")) {
    return "Path cannot start or end with spaces";
  }

  return true;
}

export async function checkPathAliasesSetup(): Promise<boolean> {
  const hasTsConfig = checkFileExists("tsconfig.json");
  const hasJsConfig = checkFileExists("jsconfig.json");

  if (!hasTsConfig && !hasJsConfig) {
    return false;
  }

  try {
    const configFile = hasTsConfig ? "tsconfig.json" : "jsconfig.json";
    const configContent = JSON.parse(fs.readFileSync(configFile, "utf8"));

    const compilerOptions = configContent?.compilerOptions;
    if (!compilerOptions) {
      return false;
    }

    // Check baseUrl
    const hasBaseUrl = !!compilerOptions.baseUrl;

    // Check path aliases
    const paths = compilerOptions.paths || {};
    const commonAliases = [
      "@/*",
      "@/components/*",
      "@/lib/*",
      "@/utils/*",
      "~/*",
    ];

    const hasValidAlias = commonAliases.some((alias) => {
      const aliasPaths = paths[alias];
      if (!Array.isArray(aliasPaths) || aliasPaths.length === 0) {
        return false;
      }

      const firstPath = aliasPaths[0];
      return typeof firstPath === "string" && firstPath.trim().length > 0;
    });

    return hasBaseUrl || hasValidAlias;
  } catch (error) {
    return false;
  }
}

export async function checkExistingDirectories(
  config: ProjectConfig
): Promise<void> {
  const hasSrcFolder = checkFileExists("src");
  const pathsToCheck = [
    { name: "components", path: config.paths.components },
    { name: "hooks", path: config.paths.hooks },
    { name: "utils", path: config.paths.utils },
  ];

  const warnings: DirectoryWarning[] = [];

  for (const { name, path: configPath } of pathsToCheck) {
    try {
      let actualPath = configPath;

      // Handle alias paths
      if (actualPath.startsWith("@/")) {
        const relativePath = actualPath.replace("@/", "");
        actualPath = hasSrcFolder
          ? path.join("src", relativePath)
          : relativePath;
      }

      const fullPath = path.join(process.cwd(), actualPath);

      if (await fs.pathExists(fullPath)) {
        const stats = await fs.stat(fullPath);

        if (!stats.isDirectory()) {
          continue;
        }

        const files = await fs.readdir(fullPath);
        const nonVerzaFiles = files.filter((file) => {
          if (file.startsWith(".")) return false;
          if (file.toLowerCase().includes("verza")) return false;
          if (["index.ts", "index.js", "index.tsx", "index.jsx"].includes(file))
            return false;
          return true;
        });

        if (nonVerzaFiles.length > 0) {
          warnings.push({
            type: name,
            path: actualPath,
            files: nonVerzaFiles.slice(0, 3),
          });
        }
      }
    } catch (error) {
      // Silently handle errors
    }
  }

  if (warnings.length > 0) {
    console.log(
      chalk.yellow("\n⚠️  Existing files detected in target directories:")
    );

    warnings.forEach((warning) => {
      const displayFiles = warning.files.slice(0, 3);
      const fileList = displayFiles.join(", ");
      const moreFiles =
        warning.files.length > 3
          ? ` and ${warning.files.length - 3} more...`
          : "";

      console.log(chalk.gray(`   ${warning.path}: ${fileList}${moreFiles}`));
    });

    console.log(chalk.gray("   Verza UI will not overwrite existing files"));
  }
}
