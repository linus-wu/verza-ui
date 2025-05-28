import fs from "fs-extra";
import path from "path";
import { checkFileExists } from "./fileHelper";

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

export function detectFrameworkType():
  | "nextjs"
  | "vite"
  | "vite-react"
  | "create-react-app"
  | "unknown" {
  // Check Next.js configuration files
  if (
    checkFileExists("next.config.js") ||
    checkFileExists("next.config.mjs") ||
    checkFileExists("next.config.ts")
  ) {
    return "nextjs";
  }

  // Check Vite configuration files
  if (checkFileExists("vite.config.js") || checkFileExists("vite.config.ts")) {
    if (hasDependency("react")) {
      return "vite-react";
    }
    return "vite";
  }

  // Check dependencies in package.json to infer framework type
  if (hasDependency("next")) {
    return "nextjs";
  }

  if (hasDependency("vite")) {
    if (hasDependency("react")) {
      return "vite-react";
    }
    return "vite";
  }

  // Check Create React App
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

  // Check configuration files
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

  // Check dependencies
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
