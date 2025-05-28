import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { installPackages } from "../packageInstaller";
import { checkFileExists } from "../fileHelper";
import { isTailwindV4OrLater } from "./detect";

const TAILWIND_VITE_PACKAGES = ["tailwindcss", "@tailwindcss/vite"];

export async function setupTailwindForVite(): Promise<void> {
  console.log(chalk.blue("🌬️ Setting up Tailwind CSS for Vite..."));

  const isV4 = isTailwindV4OrLater();
  console.log(
    chalk.gray(`   Using TailwindCSS ${isV4 ? "v4+" : "v3"} configuration`)
  );

  await installPackages(TAILWIND_VITE_PACKAGES);

  // Setup Vite configuration
  await setupViteConfig();

  // Setup CSS file
  await setupViteCssFile(isV4);

  console.log(chalk.green("✅ Tailwind CSS setup completed for Vite!"));
}

async function setupViteConfig(): Promise<void> {
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

      // Add import statement
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

      // Add plugin to plugins array
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
        // Add plugins array to defineConfig
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

      console.log(chalk.gray(`📄 Updated: ${viteConfigPath}`));
    } else {
      console.log(chalk.gray(`📄 Already configured: ${viteConfigPath}`));
    }
  } else {
    // Create new Vite config file
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

    const configFileName = isTs ? "vite.config.ts" : "vite.config.js";
    fs.writeFileSync(
      path.join(process.cwd(), configFileName),
      configTemplate,
      "utf8"
    );

    console.log(chalk.gray(`📄 Created: ${configFileName}`));
  }
}

async function setupViteCssFile(isV4: boolean): Promise<void> {
  // Vite 常用的 CSS 文件位置，按優先級排序
  const viteCssFiles = [
    "src/index.css", // Vite + React 默認
    "src/app.css", // Vite 常用
    "src/style.css", // Vite 默認模板
    "src/styles.css", // 常用命名
    "src/main.css", // 常用命名
    "index.css", // 根目錄
    "app.css", // 根目錄
    "style.css", // 根目錄
  ];

  let cssFilePath: string | null = null;

  // 尋找現有的 CSS 文件
  for (const file of viteCssFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      cssFilePath = fullPath;
      console.log(chalk.gray(`📄 Found existing CSS file: ${file}`));
      break;
    }
  }

  // 如果沒有找到現有文件，創建默認文件
  if (!cssFilePath) {
    // 優先在 src 目錄創建，如果 src 目錄存在的話
    const srcExists = fs.existsSync(path.join(process.cwd(), "src"));
    cssFilePath = srcExists
      ? path.join(process.cwd(), "src/index.css")
      : path.join(process.cwd(), "index.css");

    console.log(
      chalk.gray(
        `📄 Will create CSS file: ${path.relative(process.cwd(), cssFilePath)}`
      )
    );
  }

  // 讀取現有內容
  let cssContent = "";
  if (fs.existsSync(cssFilePath)) {
    cssContent = fs.readFileSync(cssFilePath, "utf8");
  }

  // 根據 TailwindCSS 版本設置正確的導入語句
  const tailwindImport = isV4
    ? `@import "tailwindcss";`
    : `@tailwind base;\n@tailwind components;\n@tailwind utilities;`;

  // 檢查是否已經包含 Tailwind 導入
  const hasTailwindImport = isV4
    ? cssContent.includes('@import "tailwindcss"')
    : cssContent.includes("@tailwind");

  if (!hasTailwindImport) {
    // 確保文件目錄存在
    fs.ensureDirSync(path.dirname(cssFilePath));

    // 在文件開頭添加 Tailwind 導入
    const newContent = cssContent.trim()
      ? `${tailwindImport}\n\n${cssContent}`
      : tailwindImport;

    fs.writeFileSync(cssFilePath, newContent, "utf8");
    console.log(
      chalk.gray(
        `📄 Updated CSS file: ${path.relative(process.cwd(), cssFilePath)}`
      )
    );
    console.log(
      chalk.gray(
        `   Added: ${isV4 ? '@import "tailwindcss"' : "@tailwind directives"}`
      )
    );
  } else {
    console.log(
      chalk.gray(
        `📄 CSS file already configured: ${path.relative(
          process.cwd(),
          cssFilePath
        )}`
      )
    );
  }

  // 檢查 main.js/main.ts 是否導入了 CSS 文件
  await ensureCssImportInMain(cssFilePath);
}

async function ensureCssImportInMain(cssFilePath: string): Promise<void> {
  const mainFiles = [
    "src/main.ts",
    "src/main.js",
    "src/index.ts",
    "src/index.js",
    "main.ts",
    "main.js",
    "index.ts",
    "index.js",
  ];

  let mainFilePath: string | null = null;

  // 尋找主入口文件
  for (const file of mainFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      mainFilePath = fullPath;
      break;
    }
  }

  if (!mainFilePath) {
    console.log(
      chalk.yellow(
        "⚠️  Could not find main entry file. Please manually import the CSS file."
      )
    );
    return;
  }

  const mainContent = fs.readFileSync(mainFilePath, "utf8");
  const cssRelativePath = path.relative(
    path.dirname(mainFilePath),
    cssFilePath
  );
  const importStatement = `import './${cssRelativePath.replace(/\\/g, "/")}'`;

  // 檢查是否已經導入了 CSS 文件
  const cssFileName = path.basename(cssFilePath);
  const hasImport =
    mainContent.includes(cssFileName) ||
    mainContent.includes(cssRelativePath) ||
    mainContent.includes(importStatement);

  if (!hasImport) {
    // 在其他導入語句後添加 CSS 導入
    const lines = mainContent.split("\n");
    let insertIndex = 0;

    // 找到最後一個 import 語句的位置
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith("import ")) {
        insertIndex = i + 1;
      }
    }

    lines.splice(insertIndex, 0, importStatement);
    const newContent = lines.join("\n");

    fs.writeFileSync(mainFilePath, newContent, "utf8");
    console.log(
      chalk.gray(
        `📄 Updated main file: ${path.relative(process.cwd(), mainFilePath)}`
      )
    );
    console.log(chalk.gray(`   Added CSS import: ${importStatement}`));
  } else {
    console.log(
      chalk.gray(
        `📄 CSS already imported in: ${path.relative(
          process.cwd(),
          mainFilePath
        )}`
      )
    );
  }
}
