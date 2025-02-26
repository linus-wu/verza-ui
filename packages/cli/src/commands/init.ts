import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { VerzaConfig } from "../types";
import { CONFIG_FILE_NAME, REPO_BASE_URL } from "../constants";
import {
  checkFileExists,
  detectFrameworkType,
  downloadFile,
  hasDependency,
  hasSrcDirectory,
  installPackages,
  isUsingTypeScript,
  readJsonFile,
  writeJsonFile,
} from "../utils";

const PACKAGES = ["clsx", "tailwind-merge"];
const PRETTIER_PACKAGES = ["prettier", "prettier-plugin-tailwindcss"];
const TAILWIND_NEXTJS_PACKAGES = [
  "tailwindcss",
  "@tailwindcss/postcss",
  "postcss",
];
const TAILWIND_VITE_PACKAGES = ["tailwindcss", "@tailwindcss/vite"];

async function setupPathAliases() {
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
            "@/*": [hasTsConfig ? "./src/*" : "./*"],
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

async function setupViteAliases() {
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

// 檢查是否已安裝 Tailwind CSS
function hasTailwindInstalled() {
  return hasDependency("tailwindcss");
}

// 檢查是否已經設置了 Tailwind CSS Prettier
function hasTailwindPrettierSetup() {
  const prettierFiles = [
    ".prettierrc",
    ".prettierrc.json",
    ".prettierrc.js",
    "prettier.config.js",
    ".prettierrc.mjs",
    "prettier.config.mjs",
  ];

  // 檢查是否存在任何 Prettier 配置文件
  for (const file of prettierFiles) {
    if (checkFileExists(file)) {
      try {
        let config;
        if (file.endsWith(".json") || file === ".prettierrc") {
          config = readJsonFile(file);
          if (!config) continue;
        } else {
          // 對於 JS/MJS 文件，檢查文件內容是否包含 tailwindcss 字符串
          const content = fs.readFileSync(
            path.join(process.cwd(), file),
            "utf8"
          );
          if (content.includes("tailwindcss")) {
            return true;
          }
          continue;
        }

        // 檢查 plugins 是否包含 tailwindcss
        if (config.plugins && Array.isArray(config.plugins)) {
          for (const plugin of config.plugins) {
            if (typeof plugin === "string" && plugin.includes("tailwindcss")) {
              return true;
            }
          }
        }
      } catch (error) {
        // 如果無法解析文件，我們假設它沒有設置 tailwindcss
        continue;
      }
    }
  }

  // 檢查 package.json 中是否有 prettier-plugin-tailwindcss
  return hasDependency("prettier-plugin-tailwindcss");
}

// 設置 Tailwind CSS Prettier
async function setupTailwindPrettier() {
  console.log(chalk.blue("📝 Setting up Tailwind CSS Prettier..."));

  // 安裝必要的依賴
  await installPackages(PRETTIER_PACKAGES);

  // 創建 .prettierrc 文件
  const prettierConfig = {
    plugins: ["prettier-plugin-tailwindcss"],
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
  };

  writeJsonFile(".prettierrc", prettierConfig);

  console.log(chalk.green("✅ Tailwind CSS Prettier configured successfully!"));
}

// 為 Next.js 設置 Tailwind CSS
async function setupTailwindForNextjs() {
  console.log(chalk.blue("🌬️ Setting up Tailwind CSS for Next.js..."));

  // 安裝依賴
  await installPackages(TAILWIND_NEXTJS_PACKAGES);

  // 創建 postcss.config.mjs
  const postcssConfig = `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;`;

  fs.writeFileSync(
    path.join(process.cwd(), "postcss.config.mjs"),
    postcssConfig,
    "utf8"
  );

  // 修改或創建 globals.css
  const appDir = path.join(process.cwd(), "src", "app");
  const srcStylesDir = path.join(process.cwd(), "src", "styles");
  const rootStylesDir = path.join(process.cwd(), "styles");

  let globalCssPath = "";

  // 查找 globals.css 文件位置
  if (checkFileExists("src/app/globals.css")) {
    globalCssPath = path.join(appDir, "globals.css");
  } else if (checkFileExists("src/styles/globals.css")) {
    globalCssPath = path.join(srcStylesDir, "globals.css");
  } else if (checkFileExists("styles/globals.css")) {
    globalCssPath = path.join(rootStylesDir, "globals.css");
  } else {
    // 如果找不到，創建新的
    if (checkFileExists("src/app")) {
      globalCssPath = path.join(appDir, "globals.css");
    } else if (checkFileExists("src/styles")) {
      globalCssPath = path.join(srcStylesDir, "globals.css");
    } else if (checkFileExists("styles")) {
      globalCssPath = path.join(rootStylesDir, "globals.css");
    } else {
      fs.ensureDirSync(srcStylesDir);
      globalCssPath = path.join(srcStylesDir, "globals.css");
    }
  }

  // 添加 Tailwind 導入到 CSS 文件
  let cssContent = "";
  if (fs.existsSync(globalCssPath)) {
    cssContent = fs.readFileSync(globalCssPath, "utf8");
  }

  if (!cssContent.includes('@import "tailwindcss"')) {
    cssContent = `@import "tailwindcss";\n\n${cssContent}`;
    fs.writeFileSync(globalCssPath, cssContent, "utf8");
  }

  console.log(chalk.green("✅ Tailwind CSS setup completed for Next.js!"));
  console.log(chalk.gray(`📄 Modified: ${globalCssPath}`));
  console.log(chalk.gray(`📄 Created: postcss.config.mjs`));
}

// 為 Vite React 設置 Tailwind CSS
async function setupTailwindForVite() {
  console.log(chalk.blue("🌬️ Setting up Tailwind CSS for Vite..."));

  // 安裝依賴
  await installPackages(TAILWIND_VITE_PACKAGES);

  // 更新 vite.config.js/ts
  const viteConfigPath = checkFileExists("vite.config.ts")
    ? "vite.config.ts"
    : "vite.config.js";

  if (checkFileExists(viteConfigPath)) {
    let viteConfigContent = fs.readFileSync(
      path.join(process.cwd(), viteConfigPath),
      "utf8"
    );
    const isTs = viteConfigPath.endsWith(".ts");

    if (!viteConfigContent.includes("tailwindcss")) {
      // 檢查是否已經導入了 tailwindcss
      const importLine = `import tailwindcss from '@tailwindcss/vite'`;
      const pluginLine = `tailwindcss(),`;

      // 添加導入
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

      // 添加插件
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
        // 如果沒有找到 plugins 數組
        const configRegex = /defineConfig\(\s*\{([\s\S]*?)\}\s*\)/;
        viteConfigContent = viteConfigContent.replace(
          configRegex,
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
    // 如果不存在配置文件，創建一個
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

  // 查找主 CSS 文件並添加 Tailwind 導入
  const srcDir = path.join(process.cwd(), "src");
  let cssFile = "";

  if (checkFileExists(srcDir)) {
    const cssFiles = [
      path.join(srcDir, "styles.css"),
      path.join(srcDir, "style.css"),
      path.join(srcDir, "index.css"),
      path.join(srcDir, "App.css"),
      path.join(srcDir, "styles", "index.css"),
      path.join(srcDir, "styles", "globals.css"),
      path.join(srcDir, "css", "main.css"),
    ];

    for (const file of cssFiles) {
      if (checkFileExists(file)) {
        cssFile = file;
        break;
      }
    }

    // 如果沒有找到現有的 CSS 文件，創建一個
    if (!cssFile) {
      cssFile = path.join(srcDir, "styles.css");
      fs.ensureFileSync(cssFile);
    }
  } else {
    // 如果沒有 src 目錄，在根目錄創建
    cssFile = path.join(process.cwd(), "styles.css");
    fs.ensureFileSync(cssFile);
  }

  // 添加 Tailwind 導入
  let cssContent = "";
  if (checkFileExists(cssFile)) {
    cssContent = fs.readFileSync(path.join(process.cwd(), cssFile), "utf8");
  }

  if (!cssContent.includes('@import "tailwindcss"')) {
    cssContent = `@import "tailwindcss";\n\n${cssContent}`;
    fs.writeFileSync(path.join(process.cwd(), cssFile), cssContent, "utf8");
  }

  console.log(chalk.green("✅ Tailwind CSS setup completed for Vite!"));
  console.log(chalk.gray(`📄 Modified: vite.config.js/ts`));
  console.log(chalk.gray(`📄 Modified: ${cssFile}`));
}

export async function initializeVerza() {
  const configPath = CONFIG_FILE_NAME;

  if (checkFileExists(configPath)) {
    console.log(chalk.bgCyanBright("Project has already been initialized."));
    return;
  }

  console.log(chalk.cyan("✨ Welcome to Verza UI ✨"));

  if (!checkFileExists("package.json")) {
    console.log(
      chalk.red("❌ No package.json found. Please run `npm init -y` first.")
    );
    process.exit(1);
  }

  const hasTailwind = hasTailwindInstalled();
  let shouldSetupTailwind = false;

  if (!hasTailwind) {
    const { setupTailwind } = await inquirer.prompt([
      {
        type: "confirm",
        name: "setupTailwind",
        message: "Tailwind CSS is not installed. Do you want to set it up?",
        default: true,
      },
    ]);
    shouldSetupTailwind = setupTailwind;
  } else {
    console.log(chalk.blue("ℹ️ Tailwind CSS is already installed."));
  }

  const hasTailwindPrettier = hasTailwindPrettierSetup();
  let shouldSetupTailwindPrettier = false;

  if (!hasTailwindPrettier) {
    const { useTailwindPrettier } = await inquirer.prompt([
      {
        type: "confirm",
        name: "useTailwindPrettier",
        message: "Do you want to setup Tailwind CSS Prettier?",
        default: true,
      },
    ]);
    shouldSetupTailwindPrettier = useTailwindPrettier;
  } else {
    console.log(chalk.blue("ℹ️ Tailwind CSS Prettier is already configured."));
  }

  await setupPathAliases();

  const useTypeScript = isUsingTypeScript();

  const componentPath = "@/components/verza-ui";
  const utilsPath = "@/utils";

  const verzaConfig: VerzaConfig = {
    useTypeScript,
    paths: { components: componentPath, utils: utilsPath },
    themeColors: {
      primary: [54, 111, 87],
      secondary: [89, 197, 156],
      accent: [243, 196, 77],
      warning: [247, 169, 70],
      error: [228, 81, 65],
    },
  };
  writeJsonFile(configPath, verzaConfig);

  if (shouldSetupTailwind) {
    const frameworkType = detectFrameworkType();
    if (frameworkType === "nextjs") {
      await setupTailwindForNextjs();
    } else if (frameworkType === "vite-react" || frameworkType === "vite") {
      await setupTailwindForVite();
    } else {
      console.log(
        chalk.yellow(
          "⚠️ Could not detect framework type. Please install Tailwind CSS manually."
        )
      );
      console.log(
        chalk.gray(
          "Visit https://tailwindcss.com/docs/installation for installation instructions."
        )
      );
    }
  }

  installPackages(PACKAGES);

  if (shouldSetupTailwindPrettier) {
    await setupTailwindPrettier();
  }

  const hasSrcFolder = hasSrcDirectory();
  const actualUtilsPath = hasSrcFolder ? "src/utils/" : "utils/";
  const utilsDirPath = path.join(process.cwd(), actualUtilsPath);
  await fs.ensureDir(utilsDirPath);

  const isTypeScriptProject = useTypeScript;
  const fileExtension = isTypeScriptProject ? "ts" : "js";
  const cnFilePath = path.join(utilsDirPath, `cn.${fileExtension}`);

  if (!checkFileExists(cnFilePath)) {
    const cnFileUrl = `${REPO_BASE_URL}/cn.${fileExtension}`;
    try {
      await downloadFile(cnFileUrl, cnFilePath);
    } catch (error) {
      console.log(
        chalk.red(
          `⚠️ Failed to download ${cnFileUrl}, you may need to manually add cn.ts.`
        )
      );
    }
  }

  console.log(chalk.greenBright("🎉 Verza UI initialized successfully!"));
}
