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
    let viteConfigContent = fs.readFileSync(
      path.join(process.cwd(), viteConfigPath),
      "utf8"
    );

    // More comprehensive check for existing aliases
    const hasAliasConfig =
      /alias\s*:\s*{[^}]*['"`]@['"`]\s*:/m.test(viteConfigContent) ||
      /alias\s*:\s*{[^}]*@\s*:/m.test(viteConfigContent);

    if (hasAliasConfig) {
      console.log(
        chalk.blue(`ℹ️ Path aliases already configured in ${viteConfigPath}`)
      );
      return true;
    }

    const srcPath = hasSrcDirectory() ? "./src" : ".";

    // Check if we need to add path import
    const needsPathImport =
      !/import\s+path\s+from\s+['"`]path['"`]/m.test(viteConfigContent) &&
      !/const\s+path\s*=\s*require\s*\(\s*['"`]path['"`]\s*\)/m.test(
        viteConfigContent
      );

    // Add necessary imports
    if (needsPathImport) {
      const lines = viteConfigContent.split("\n");
      let insertIndex = 0;

      // Find the best position to insert the import
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("import ")) {
          insertIndex = i + 1;
        } else if (
          line.startsWith("export default") ||
          line.includes("defineConfig")
        ) {
          break;
        }
      }

      // If no imports found, insert at the beginning
      if (insertIndex === 0) {
        insertIndex = 0;
      }

      lines.splice(insertIndex, 0, "import path from 'path'");
      viteConfigContent = lines.join("\n");
    }

    // Use the recommended Vite alias configuration
    const aliasConfig = `'@': path.resolve(__dirname, '${srcPath}')`;

    let configUpdated = false;

    // Try to find and update existing resolve.alias section
    if (/resolve\s*:\s*{[^}]*alias\s*:\s*{/m.test(viteConfigContent)) {
      // Add to existing alias section
      const aliasPattern = /(alias\s*:\s*{)([^}]*)(})/m;
      const aliasMatch = viteConfigContent.match(aliasPattern);

      if (aliasMatch) {
        const opening = aliasMatch[1];
        const content = aliasMatch[2];
        const closing = aliasMatch[3];

        const hasContent = content.trim().length > 0;
        const separator = hasContent ? ",\n      " : "\n      ";

        viteConfigContent = viteConfigContent.replace(
          aliasMatch[0],
          `${opening}${content}${separator}${aliasConfig}\n    ${closing}`
        );
        configUpdated = true;
      }
    } else if (/resolve\s*:\s*{/m.test(viteConfigContent)) {
      // Add alias to existing resolve section
      const resolvePattern = /(resolve\s*:\s*{)([^}]*)(})/m;
      const resolveMatch = viteConfigContent.match(resolvePattern);

      if (resolveMatch) {
        const opening = resolveMatch[1];
        const content = resolveMatch[2];
        const closing = resolveMatch[3];

        const hasContent = content.trim().length > 0;
        const separator = hasContent ? ",\n    " : "\n    ";

        viteConfigContent = viteConfigContent.replace(
          resolveMatch[0],
          `${opening}${content}${separator}alias: {\n      ${aliasConfig}\n    }\n  ${closing}`
        );
        configUpdated = true;
      }
    } else {
      // Add entire resolve section
      // Try different patterns for defineConfig
      const patterns = [
        /(defineConfig\s*\(\s*{)([^}]*(?:{[^}]*}[^}]*)*)(}\s*\))/m,
        /(export\s+default\s+defineConfig\s*\(\s*{)([^}]*)(}\s*\))/m,
        /(export\s+default\s+{)([^}]*)(})/m,
      ];

      for (const pattern of patterns) {
        const match = viteConfigContent.match(pattern);
        if (match) {
          const opening = match[1];
          const content = match[2];
          const closing = match[3];

          const hasContent = content.trim().length > 0;
          const separator = hasContent ? ",\n  " : "\n  ";

          viteConfigContent = viteConfigContent.replace(
            match[0],
            `${opening}${content}${separator}resolve: {\n    alias: {\n      ${aliasConfig}\n    }\n  }\n${closing}`
          );
          configUpdated = true;
          break;
        }
      }
    }

    if (!configUpdated) {
      throw new Error(
        "Could not find a suitable place to add the alias configuration"
      );
    }

    // Write the updated config
    fs.writeFileSync(
      path.join(process.cwd(), viteConfigPath),
      viteConfigContent,
      "utf8"
    );

    console.log(chalk.green(`✅ Updated ${viteConfigPath} with path aliases`));
    console.log(chalk.gray(`   Added: '@' alias pointing to '${srcPath}'`));

    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Failed to update ${viteConfigPath}`), error);

    // Fallback: show manual configuration
    console.log(
      chalk.yellow(
        `⚠️ Automatic configuration failed. Please manually update your ${viteConfigPath} with the following:`
      )
    );

    const srcPath = hasSrcDirectory() ? "./src" : ".";
    console.log(
      chalk.gray(`
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  // ... your existing config
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '${srcPath}'),
    },
  },
})
      `)
    );

    return false;
  }
}
