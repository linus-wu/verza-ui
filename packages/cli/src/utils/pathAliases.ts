import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { hasSrcDirectory } from "./projectDetector";
import { checkFileExists, readJsonFile, writeJsonFile } from "./fileHelper";

export async function setupPathAliases() {
  const isNextJs =
    checkFileExists("next.config.js") ||
    checkFileExists("next.config.mjs") ||
    checkFileExists("next.config.ts");
  const hasTsConfig = checkFileExists("tsconfig.json");
  const hasJsConfig = checkFileExists("jsconfig.json");

  const configFileName = hasTsConfig
    ? "tsconfig.json"
    : hasJsConfig
    ? "jsconfig.json"
    : null;

  if (!configFileName && isNextJs) {
    // Only auto-create config files for Next.js projects
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
              chalk.cyan(
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
      }

      return true;
    } catch (error) {
      console.error(chalk.red(`❌ Failed to update ${configFileName}`), error);
      return false;
    }
  }

  // For non-Next.js projects, only provide guidance
  if (!isNextJs) {
    console.log(
      chalk.yellow(
        "⚠️  For non-Next.js projects, you may need to manually configure path aliases."
      )
    );
    console.log(
      chalk.gray(
        "   Please refer to our documentation for your specific framework setup."
      )
    );
  }

  return false;
}
