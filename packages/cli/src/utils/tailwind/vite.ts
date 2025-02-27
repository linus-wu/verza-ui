import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { installPackages } from "../installPackages";
import { checkFileExists } from "../fileUtils";

const TAILWIND_VITE_PACKAGES = ["tailwindcss", "@tailwindcss/vite"];

export async function setupTailwindForVite(): Promise<void> {
  console.log(chalk.blue("🌬️ Setting up Tailwind CSS for Vite..."));

  await installPackages(TAILWIND_VITE_PACKAGES);

  const viteConfigPath = checkFileExists("vite.config.ts")
    ? "vite.config.ts"
    : "vite.config.js";

  if (checkFileExists(viteConfigPath)) {
    let viteConfigContent = fs.readFileSync(
      path.join(process.cwd(), viteConfigPath),
      "utf8"
    );

    if (!viteConfigContent.includes("tailwindcss")) {
      const importLine = `import tailwindcss from '@tailwindcss/vite'`;
      const pluginLine = `tailwindcss(),`;

      if (!viteConfigContent.includes(importLine)) {
        const importRegex = /import .+ from ['"]vite['"]/;
        if (importRegex.test(viteConfigContent)) {
          viteConfigContent = viteConfigContent.replace(
            importRegex,
            (match) => `${match}\n${importLine}`
          );
        } else {
          viteConfigContent = `${importLine}\n${viteConfigContent}`;
        }
      }

      const pluginsRegex = /plugins:\s*\[([\s\S]*?)\]/;
      if (pluginsRegex.test(viteConfigContent)) {
        viteConfigContent = viteConfigContent.replace(
          pluginsRegex,
          (match, plugins) => {
            if (plugins.trim()) {
              return match.replace(
                plugins,
                `${
                  plugins.trim().endsWith(",") ? plugins : `${plugins},`
                } ${pluginLine}`
              );
            } else {
              return match.replace(plugins, ` ${pluginLine} `);
            }
          }
        );
      } else {
        const defineConfigRegex = /defineConfig\(\s*\{([\s\S]*?)\}\s*\)/;
        viteConfigContent = viteConfigContent.replace(
          defineConfigRegex,
          (match, config) => {
            if (config.trim()) {
              return match.replace(
                config,
                `${
                  config.trim().endsWith(",") ? config : `${config},`
                } plugins: [${pluginLine}]`
              );
            } else {
              return match.replace(config, ` plugins: [${pluginLine}] `);
            }
          }
        );
      }

      fs.writeFileSync(
        path.join(process.cwd(), viteConfigPath),
        viteConfigContent,
        "utf8"
      );
    }
  } else {
    const isTs = checkFileExists("tsconfig.json");
    const configTemplate = isTs
      ? `import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})`
      : `import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})`;

    fs.writeFileSync(
      path.join(process.cwd(), isTs ? "vite.config.ts" : "vite.config.js"),
      configTemplate,
      "utf8"
    );
  }

  const srcDir = path.join(process.cwd(), "src");
  const srcIndexCss = path.join(srcDir, "index.css");
  const rootIndexCss = path.join(process.cwd(), "index.css");
  let cssFile = "";

  if (checkFileExists("src/index.css")) {
    cssFile = srcIndexCss;
  } else if (checkFileExists("index.css")) {
    cssFile = rootIndexCss;
  } else if (checkFileExists("src")) {
    cssFile = srcIndexCss;
  } else {
    cssFile = rootIndexCss;
  }

  let cssContent = "";
  if (fs.existsSync(cssFile)) {
    cssContent = fs.readFileSync(cssFile, "utf8");
  }

  const tailwindDirectives = `@import "tailwindcss";`;

  if (!cssContent.includes("@tailwind")) {
    cssContent = `${tailwindDirectives}\n\n${cssContent}`;
    fs.ensureFileSync(cssFile);
    fs.writeFileSync(cssFile, cssContent, "utf8");
  }

  console.log(chalk.green("✅ Tailwind CSS setup completed for Vite!"));
  console.log(chalk.gray(`📄 Modified: ${viteConfigPath}`));
  console.log(chalk.gray(`📄 Modified/Created: ${cssFile}`));
}
