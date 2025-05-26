import fs from "fs-extra";
import path from "path";

export function checkFileExists(filePath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

export function hasDependency(dependencyName: string): boolean {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const allDependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    return Object.keys(allDependencies).includes(dependencyName);
  } catch (error) {
    return false;
  }
}

export function readJsonFile(filePath: string): any {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    return null;
  }
}

export function writeJsonFile(filePath: string, data: any): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    return false;
  }
}

export function detectFrameworkType():
  | "nextjs"
  | "vite"
  | "vite-react"
  | "create-react-app"
  | "unknown" {
  // 檢查 Next.js 配置檔案
  if (
    checkFileExists("next.config.js") ||
    checkFileExists("next.config.mjs") ||
    checkFileExists("next.config.ts")
  ) {
    return "nextjs";
  }

  // 檢查 Vite 配置檔案
  if (checkFileExists("vite.config.js") || checkFileExists("vite.config.ts")) {
    if (hasDependency("react")) {
      return "vite-react";
    }
    return "vite";
  }

  // 檢查 package.json 中的依賴來推斷框架類型
  if (hasDependency("next")) {
    return "nextjs";
  }

  if (hasDependency("vite")) {
    if (hasDependency("react")) {
      return "vite-react";
    }
    return "vite";
  }

  // 檢查 Create React App
  if (hasDependency("react-scripts")) {
    return "create-react-app";
  }

  return "unknown";
}

export function getFrameworkDetectionInfo(): {
  framework: string;
  detectedFiles: string[];
  detectedDependencies: string[];
} {
  const detectedFiles: string[] = [];
  const detectedDependencies: string[] = [];

  // 檢查配置檔案
  const configFiles = [
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "vite.config.js",
    "vite.config.ts",
  ];

  configFiles.forEach((file) => {
    if (checkFileExists(file)) {
      detectedFiles.push(file);
    }
  });

  // 檢查依賴
  const dependencies = ["next", "vite", "react", "react-scripts"];
  dependencies.forEach((dep) => {
    if (hasDependency(dep)) {
      detectedDependencies.push(dep);
    }
  });

  return {
    framework: detectFrameworkType(),
    detectedFiles,
    detectedDependencies,
  };
}

export function isUsingTypeScript(): boolean {
  const hasTsConfig = checkFileExists("tsconfig.json");
  const hasTypeScriptDependency = hasDependency("typescript");

  return hasTsConfig || hasTypeScriptDependency;
}

export function hasSrcDirectory(): boolean {
  return checkFileExists("src");
}
