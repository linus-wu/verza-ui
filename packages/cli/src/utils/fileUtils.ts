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
  | "unknown" {
  if (checkFileExists("next.config.js") || checkFileExists("next.config.mjs")) {
    return "nextjs";
  }

  if (checkFileExists("vite.config.js") || checkFileExists("vite.config.ts")) {
    if (hasDependency("react")) {
      return "vite-react";
    }
    return "vite";
  }

  return "unknown";
}

export function isUsingTypeScript(): boolean {
  const hasTsConfig = checkFileExists("tsconfig.json");
  const hasTypeScriptDependency = hasDependency("typescript");

  return hasTsConfig || hasTypeScriptDependency;
}

export function hasSrcDirectory(): boolean {
  return checkFileExists("src");
}
