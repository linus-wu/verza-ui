import fs from "fs-extra";
import path from "path";
import { hasDependency, checkFileExists, readJsonFile } from "../fileUtils";

export function hasTailwindInstalled(): boolean {
  return hasDependency("tailwindcss");
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
