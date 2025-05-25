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
    checkFileExists("next.config.js") ||
    checkFileExists("next.config.mjs") ||
    checkFileExists("next.config.ts");
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
    // Determine which config file to create based on project type
    let packageJson = null;

    if (checkFileExists("package.json")) {
      try {
        packageJson = readJsonFile("package.json");
      } catch (error) {
        // Ignore error, will default to jsconfig
      }
    }

    const isTypeScriptProject =
      packageJson?.devDependencies?.typescript ||
      packageJson?.dependencies?.typescript ||
      (function () {
        try {
          const srcDir = path.join(process.cwd(), "src");
          return (
            fs.existsSync(srcDir) &&
            fs
              .readdirSync(srcDir)
              .some((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
          );
        } catch (error) {
          return false;
        }
      })();

    const configFileToCreate = isTypeScriptProject
      ? "tsconfig.json"
      : "jsconfig.json";

    const { shouldCreateConfig } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldCreateConfig",
        message: `No ${configFileToCreate} found. Would you like to create one with path aliases?`,
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

      writeJsonFile(configFileToCreate, configContent);

      console.log(
        chalk.green(`✅ Created ${configFileToCreate} with path aliases`)
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

        // Check if user already has @ alias pointing to different path
        const existingAtAlias = configContent.compilerOptions.paths["@/*"];
        const expectedPath = hasSrcDirectory() ? "./src/*" : "./*";

        if (existingAtAlias && existingAtAlias[0] !== expectedPath) {
          console.log(
            chalk.yellow(
              `⚠️ Found existing @ alias pointing to: ${existingAtAlias[0]}`
            )
          );
          console.log(
            chalk.yellow(`   Verza UI expects @ to point to: ${expectedPath}`)
          );

          const { shouldOverride } = await inquirer.prompt([
            {
              type: "confirm",
              name: "shouldOverride",
              message:
                "Do you want to update the @ alias to match Verza UI's expected path?",
              default: false,
            },
          ]);

          if (!shouldOverride) {
            console.log(
              chalk.blue(
                "ℹ️ Keeping existing @ alias. You may need to adjust Verza UI component paths manually."
              )
            );
            return true;
          }
        }

        configContent.compilerOptions.paths["@/*"] = [expectedPath];
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

        // Still check Vite config even if tsconfig/jsconfig is already set up
        if (isVite) {
          await setupViteAliases();
        }

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
    : checkFileExists("vite.config.js")
    ? "vite.config.js"
    : null;

  if (!viteConfigPath) {
    console.log(chalk.yellow("⚠️ No Vite config file found"));
    return false;
  }

  try {
    const viteConfigContent = fs.readFileSync(
      path.join(process.cwd(), viteConfigPath),
      "utf8"
    );

    // More comprehensive check for existing aliases
    const hasAliasConfig =
      viteConfigContent.includes("alias") &&
      (viteConfigContent.includes("'@'") ||
        viteConfigContent.includes('"@"') ||
        viteConfigContent.includes("@/"));

    if (hasAliasConfig) {
      console.log(
        chalk.blue(`ℹ️ Path aliases already configured in ${viteConfigPath}`)
      );
      return true;
    }

    console.log(
      chalk.yellow(
        `⚠️ Please manually update your ${viteConfigPath} with the following configuration:`
      )
    );

    const isTypeScript = viteConfigPath.endsWith(".ts");
    const srcPath = hasSrcDirectory() ? "./src" : ".";

    if (isTypeScript) {
      console.log(
        chalk.gray(`
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('${srcPath}', import.meta.url)),
    },
  },
})
      `)
      );
    } else {
      console.log(
        chalk.gray(`
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('${srcPath}', import.meta.url)),
    },
  },
})
      `)
      );
    }

    console.log(
      chalk.cyan("💡 Or if you prefer using __dirname (CommonJS style):")
    );
    console.log(
      chalk.gray(`
resolve: {
  alias: {
    '@': path.resolve(__dirname, '${srcPath}'),
  },
}
    `)
    );

    console.log(
      chalk.cyan("💡 Or if you already have a resolve section, just add:")
    );
    console.log(
      chalk.gray(`
resolve: {
  alias: {
    '@': fileURLToPath(new URL('${srcPath}', import.meta.url)),
  },
}
    `)
    );

    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Failed to read ${viteConfigPath}`), error);
    return false;
  }
}
