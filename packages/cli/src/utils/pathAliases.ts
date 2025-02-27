import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import {
  checkFileExists,
  hasSrcDirectory,
  readJsonFile,
  writeJsonFile,
} from "./fileUtils";

export async function setupPathAliases() {
  const isNextJs =
    checkFileExists("next.config.js") || checkFileExists("next.config.mjs");
  const isVite =
    checkFileExists("vite.config.js") || checkFileExists("vite.config.ts");
  const hasTsConfig = checkFileExists("tsconfig.json");
  const hasJsConfig = checkFileExists("jsconfig.json");

  const configFileName = hasTsConfig
    ? "tsconfig.json"
    : hasJsConfig
    ? "jsconfig.json"
    : null;

  if (!configFileName && (isNextJs || isVite)) {
    const { shouldCreateConfig } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldCreateConfig",
        message: `No ${
          hasTsConfig ? "tsconfig.json" : "jsconfig.json"
        } found. Would you like to create one with path aliases?`,
        default: true,
      },
    ]);

    if (shouldCreateConfig) {
      const configContent = {
        compilerOptions: {
          baseUrl: ".",
          paths: {
            "@/*": [hasSrcDirectory() ? "./src/*" : "./*"],
          },
        },
      };

      writeJsonFile(
        hasTsConfig ? "tsconfig.json" : "jsconfig.json",
        configContent
      );

      console.log(
        chalk.green(
          `✅ Created ${
            hasTsConfig ? "tsconfig.json" : "jsconfig.json"
          } with path aliases`
        )
      );
      return true;
    }
    return false;
  }

  if (configFileName) {
    try {
      const configContent = readJsonFile(configFileName);
      if (!configContent) return false;

      if (!configContent.compilerOptions) {
        configContent.compilerOptions = {};
      }

      let aliasesUpdated = false;

      if (!configContent.compilerOptions.baseUrl) {
        configContent.compilerOptions.baseUrl = ".";
        aliasesUpdated = true;
      }

      if (
        !configContent.compilerOptions.paths ||
        !configContent.compilerOptions.paths["@/*"]
      ) {
        if (!configContent.compilerOptions.paths) {
          configContent.compilerOptions.paths = {};
        }

        configContent.compilerOptions.paths["@/*"] = [
          hasTsConfig && hasSrcDirectory() ? "./src/*" : "./*",
        ];
        aliasesUpdated = true;
      }

      if (aliasesUpdated) {
        writeJsonFile(configFileName, configContent);
        console.log(
          chalk.green(`✅ Updated ${configFileName} with path aliases`)
        );

        if (isVite) {
          await setupViteAliases();
        }

        return true;
      } else {
        console.log(
          chalk.blue(`ℹ️ Path aliases already configured in ${configFileName}`)
        );
        return true;
      }
    } catch (error) {
      console.error(chalk.red(`❌ Failed to update ${configFileName}`), error);
      return false;
    }
  }

  return false;
}

export async function setupViteAliases() {
  const viteConfigPath = checkFileExists("vite.config.ts")
    ? "vite.config.ts"
    : "vite.config.js";

  if (!checkFileExists(viteConfigPath)) {
    return false;
  }

  try {
    const viteConfigContent = fs.readFileSync(
      path.join(process.cwd(), viteConfigPath),
      "utf8"
    );

    if (
      viteConfigContent.includes("@/") &&
      viteConfigContent.includes("alias")
    ) {
      console.log(
        chalk.blue(`ℹ️ Path aliases already configured in Vite config`)
      );
      return true;
    }

    console.log(
      chalk.yellow(
        `⚠️ Please manually update your vite.config.js/ts with the following:`
      )
    );
    console.log(`
import path from 'path';

export default defineConfig({
  // ... your existing config
  resolve: {
    alias: {
      '@': path.resolve(__dirname, ${hasSrcDirectory() ? "'./src'" : "'.'"}),
    },
  },
});
    `);

    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Failed to update Vite config`), error);
    return false;
  }
}
