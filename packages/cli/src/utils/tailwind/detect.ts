import fs from "fs-extra";
import path from "path";
import { hasDependency } from "../projectDetector";
import { checkFileExists, readJsonFile } from "../fileHelper";

export function hasTailwindInstalled(): boolean {
  return hasDependency("tailwindcss");
}

export function getTailwindVersion(): string | null {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return null;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const allDependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    const tailwindVersion = allDependencies.tailwindcss;
    if (!tailwindVersion) {
      return null;
    }

    // 首先嘗試從實際安裝的包中獲取版本
    try {
      const tailwindPkgPath = path.join(
        process.cwd(),
        "node_modules",
        "tailwindcss",
        "package.json"
      );
      if (fs.existsSync(tailwindPkgPath)) {
        const tailwindPkg = JSON.parse(
          fs.readFileSync(tailwindPkgPath, "utf8")
        );
        return tailwindPkg.version;
      }
    } catch {
      // 如果無法讀取實際安裝的版本，繼續使用 package.json 中的版本
    }

    // 處理不同的版本格式
    // 1. 完整版本號: "4.0.0", "^4.0.0", "~4.0.0"
    const fullVersionMatch = tailwindVersion.match(/(\d+\.\d+\.\d+)/);
    if (fullVersionMatch) {
      return fullVersionMatch[1];
    }

    // 2. 主版本號: "^4", "~4", "4"
    const majorVersionMatch = tailwindVersion.match(/[\^~]?(\d+)$/);
    if (majorVersionMatch) {
      return `${majorVersionMatch[1]}.0.0`;
    }

    // 3. 主.次版本號: "^4.0", "~4.0", "4.0"
    const majorMinorMatch = tailwindVersion.match(/[\^~]?(\d+\.\d+)$/);
    if (majorMinorMatch) {
      return `${majorMinorMatch[1]}.0`;
    }

    // 4. 預發布版本: "4.0.0-alpha.1", "^4.0.0-beta.1"
    const preReleaseMatch = tailwindVersion.match(
      /[\^~]?(\d+\.\d+\.\d+)[-.]?(alpha|beta|rc)?/
    );
    if (preReleaseMatch) {
      return preReleaseMatch[1];
    }

    // 如果都無法匹配，返回原始版本字符串
    return tailwindVersion.replace(/[\^~]/g, "");
  } catch (error) {
    return null;
  }
}

export function isTailwindV4OrLater(): boolean {
  const version = getTailwindVersion();
  if (!version) {
    return false;
  }

  try {
    // 解析主版本號
    const versionParts = version.split(".");
    const majorVersion = parseInt(versionParts[0]);

    // 檢查是否為有效數字
    if (isNaN(majorVersion)) {
      console.warn(`⚠️  Could not parse major version from: ${version}`);
      return false;
    }

    return majorVersion >= 4;
  } catch (error) {
    console.warn(`⚠️  Error parsing version "${version}":`, error);
    return false;
  }
}

export function hasTailwindPrettierSetup(): boolean {
  const prettierFiles = [
    ".prettierrc",
    ".prettierrc.json",
    ".prettierrc.js",
    "prettier.config.js",
    ".prettierrc.mjs",
    "prettier.config.mjs",
  ];

  for (const file of prettierFiles) {
    if (checkFileExists(file)) {
      try {
        let config;
        if (file.endsWith(".json") || file === ".prettierrc") {
          config = readJsonFile(file);
          if (!config) continue;
        } else {
          const content = fs.readFileSync(
            path.join(process.cwd(), file),
            "utf8"
          );
          if (content.includes("tailwindcss")) {
            return true;
          }
          continue;
        }

        if (config.plugins && Array.isArray(config.plugins)) {
          for (const plugin of config.plugins) {
            if (typeof plugin === "string" && plugin.includes("tailwindcss")) {
              return true;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
  }

  return hasDependency("prettier-plugin-tailwindcss");
}
