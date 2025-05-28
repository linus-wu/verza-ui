import { promises as fs } from "fs";
import path from "path";
import chalk from "chalk";
import { checkFileExists } from "../fileHelper";
import { isTailwindV4OrLater, getTailwindVersion } from "./detect";

// Custom color palette for the design system
const customColorPalette = {
  text: {
    primary: "#171717",
    secondary: "#525252",
    muted: "#A3A3A3",
    inverse: "#FFFFFF",
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F5F5F5",
    elevated: "#FFFFFF",
  },
  border: {
    default: "#E5E5E5",
    focus: "#3B82F6",
  },
  interactive: {
    primary: "#3B82F6",
    primaryHover: "#2563EB",
    secondary: "#6B7280",
    secondaryHover: "#4B5563",
  },
  status: {
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
  },
};

/**
 * Generate TailwindCSS v3 configuration with custom colors
 */
function generateV3Config(isTypeScript: boolean): string {
  if (isTypeScript) {
    return `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        text: {
          primary: '${customColorPalette.text.primary}',
          secondary: '${customColorPalette.text.secondary}',
          muted: '${customColorPalette.text.muted}',
          inverse: '${customColorPalette.text.inverse}',
        },
        background: {
          primary: '${customColorPalette.background.primary}',
          secondary: '${customColorPalette.background.secondary}',
          elevated: '${customColorPalette.background.elevated}',
        },
        border: {
          DEFAULT: '${customColorPalette.border.default}',
          focus: '${customColorPalette.border.focus}',
        },
        interactive: {
          primary: '${customColorPalette.interactive.primary}',
          'primary-hover': '${customColorPalette.interactive.primaryHover}',
          secondary: '${customColorPalette.interactive.secondary}',
          'secondary-hover': '${customColorPalette.interactive.secondaryHover}',
        },
        status: {
          success: '${customColorPalette.status.success}',
          warning: '${customColorPalette.status.warning}',
          error: '${customColorPalette.status.error}',
        },
      },
    },
  },
  plugins: [],
}

export default config`;
  } else {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        text: {
          primary: '${customColorPalette.text.primary}',
          secondary: '${customColorPalette.text.secondary}',
          muted: '${customColorPalette.text.muted}',
          inverse: '${customColorPalette.text.inverse}',
        },
        background: {
          primary: '${customColorPalette.background.primary}',
          secondary: '${customColorPalette.background.secondary}',
          elevated: '${customColorPalette.background.elevated}',
        },
        border: {
          DEFAULT: '${customColorPalette.border.default}',
          focus: '${customColorPalette.border.focus}',
        },
        interactive: {
          primary: '${customColorPalette.interactive.primary}',
          'primary-hover': '${customColorPalette.interactive.primaryHover}',
          secondary: '${customColorPalette.interactive.secondary}',
          'secondary-hover': '${customColorPalette.interactive.secondaryHover}',
        },
        status: {
          success: '${customColorPalette.status.success}',
          warning: '${customColorPalette.status.warning}',
          error: '${customColorPalette.status.error}',
        },
      },
    },
  },
  plugins: [],
}`;
  }
}

/**
 * Generate TailwindCSS v4 configuration with custom colors using @theme directive
 */
function generateV4Config(): string {
  return `@theme {
  --color-text-primary: ${customColorPalette.text.primary};
  --color-text-secondary: ${customColorPalette.text.secondary};
  --color-text-muted: ${customColorPalette.text.muted};
  --color-text-inverse: ${customColorPalette.text.inverse};
  
  --color-background-primary: ${customColorPalette.background.primary};
  --color-background-secondary: ${customColorPalette.background.secondary};
  --color-background-elevated: ${customColorPalette.background.elevated};
  
  --color-border-default: ${customColorPalette.border.default};
  --color-border-focus: ${customColorPalette.border.focus};
  
  --color-interactive-primary: ${customColorPalette.interactive.primary};
  --color-interactive-primary-hover: ${customColorPalette.interactive.primaryHover};
  --color-interactive-secondary: ${customColorPalette.interactive.secondary};
  --color-interactive-secondary-hover: ${customColorPalette.interactive.secondaryHover};
  
  --color-status-success: ${customColorPalette.status.success};
  --color-status-warning: ${customColorPalette.status.warning};
  --color-status-error: ${customColorPalette.status.error};
}`;
}

/**
 * Generate example configuration for manual addition
 */
function generateExampleConfig(): string {
  return `// Add these colors to your theme.extend.colors section:
colors: {
  text: {
    primary: '${customColorPalette.text.primary}',
    secondary: '${customColorPalette.text.secondary}',
    muted: '${customColorPalette.text.muted}',
    inverse: '${customColorPalette.text.inverse}',
  },
  background: {
    primary: '${customColorPalette.background.primary}',
    secondary: '${customColorPalette.background.secondary}',
    elevated: '${customColorPalette.background.elevated}',
  },
  border: {
    DEFAULT: '${customColorPalette.border.default}',
    focus: '${customColorPalette.border.focus}',
  },
  interactive: {
    primary: '${customColorPalette.interactive.primary}',
    'primary-hover': '${customColorPalette.interactive.primaryHover}',
    secondary: '${customColorPalette.interactive.secondary}',
    'secondary-hover': '${customColorPalette.interactive.secondaryHover}',
  },
  status: {
    success: '${customColorPalette.status.success}',
    warning: '${customColorPalette.status.warning}',
    error: '${customColorPalette.status.error}',
  },
}`;
}

/**
 * Parse and merge custom colors into existing Tailwind v3 configuration
 */
async function mergeColorsIntoExistingConfig(
  configPath: string,
  isTypeScript: boolean
): Promise<boolean> {
  try {
    const existingConfig = await fs.readFile(configPath, "utf-8");

    // Check if our custom colors already exist (more specific check)
    const hasVerzaColors =
      existingConfig.includes("text:") &&
      existingConfig.includes("background:") &&
      existingConfig.includes("interactive:") &&
      existingConfig.includes(customColorPalette.text.primary);

    if (hasVerzaColors) {
      console.log(
        chalk.yellow("⚠️  Verza UI colors already exist in Tailwind config")
      );
      return false;
    }

    // Validate that this is a valid Tailwind config file
    if (
      !existingConfig.includes("module.exports") &&
      !existingConfig.includes("export default") &&
      !existingConfig.includes("const config")
    ) {
      console.log(
        chalk.yellow(
          "⚠️  This does not appear to be a valid Tailwind config file"
        )
      );
      return false;
    }

    // Try to find the colors section and merge intelligently
    let updatedConfig = existingConfig;

    const verzaColors = {
      text: {
        primary: customColorPalette.text.primary,
        secondary: customColorPalette.text.secondary,
        muted: customColorPalette.text.muted,
        inverse: customColorPalette.text.inverse,
      },
      background: {
        primary: customColorPalette.background.primary,
        secondary: customColorPalette.background.secondary,
        elevated: customColorPalette.background.elevated,
      },
      border: {
        DEFAULT: customColorPalette.border.default,
        focus: customColorPalette.border.focus,
      },
      interactive: {
        primary: customColorPalette.interactive.primary,
        "primary-hover": customColorPalette.interactive.primaryHover,
        secondary: customColorPalette.interactive.secondary,
        "secondary-hover": customColorPalette.interactive.secondaryHover,
      },
      status: {
        success: customColorPalette.status.success,
        warning: customColorPalette.status.warning,
        error: customColorPalette.status.error,
      },
    };

    // Convert colors to string format with proper indentation
    const formatColors = (colors: any, indent: number = 8): string => {
      const spaces = " ".repeat(indent);
      let result = "";

      for (const [key, value] of Object.entries(colors)) {
        if (typeof value === "object" && value !== null) {
          result += `${spaces}${key}: {\n`;
          result += formatColors(value, indent + 2);
          result += `${spaces}},\n`;
        } else {
          result += `${spaces}${key}: '${value}',\n`;
        }
      }

      return result;
    };

    const verzaColorsString = formatColors(verzaColors).slice(0, -1); // Remove last comma

    // Strategy 1: Look for existing colors section in theme.extend
    const colorsInExtendRegex =
      /(\s*extend:\s*{[^}]*?)(\s*colors:\s*{[^}]*(?:{[^}]*}[^}]*)*})/;
    if (colorsInExtendRegex.test(updatedConfig)) {
      updatedConfig = updatedConfig.replace(
        colorsInExtendRegex,
        (match, beforeColors, colorsSection) => {
          // Extract existing colors content
          const colorsContentMatch = colorsSection.match(
            /colors:\s*{([^}]*(?:{[^}]*}[^}]*)*)}/
          );
          if (colorsContentMatch) {
            const existingColorsContent = colorsContentMatch[1].trim();
            const separator = existingColorsContent ? ",\n" : "\n";
            return `${beforeColors}        colors: {\n${existingColorsContent}${separator}${verzaColorsString}\n        }`;
          }
          return match;
        }
      );
    }
    // Strategy 2: Look for theme.extend without colors
    else {
      const extendRegex = /(\s*extend:\s*{)([^}]*(?:{[^}]*}[^}]*)*)(})/;
      if (extendRegex.test(updatedConfig)) {
        updatedConfig = updatedConfig.replace(
          extendRegex,
          (match, openBrace, content, closeBrace) => {
            const cleanContent = content.trim();
            const separator = cleanContent ? ",\n" : "";
            return `${openBrace}${content}${separator}        colors: {\n${verzaColorsString}\n        }\n    ${closeBrace}`;
          }
        );
      }
      // Strategy 3: Look for theme without extend
      else {
        const themeRegex = /(\s*theme:\s*{)([^}]*(?:{[^}]*}[^}]*)*)(})/;
        if (themeRegex.test(updatedConfig)) {
          updatedConfig = updatedConfig.replace(
            themeRegex,
            (match, openBrace, content, closeBrace) => {
              const cleanContent = content.trim();
              const separator = cleanContent ? ",\n" : "";
              return `${openBrace}${content}${separator}    extend: {\n        colors: {\n${verzaColorsString}\n        }\n    }\n  ${closeBrace}`;
            }
          );
        }
        // Strategy 4: Add theme section to config object
        else {
          const configObjectRegex =
            /(module\.exports\s*=\s*{|export\s+default\s+{|const\s+config[^=]*=\s*{)/;
          if (configObjectRegex.test(updatedConfig)) {
            updatedConfig = updatedConfig.replace(
              configObjectRegex,
              (match) => {
                return `${match}\n  theme: {\n    extend: {\n        colors: {\n${verzaColorsString}\n        }\n    }\n  },`;
              }
            );
          } else {
            // Fallback: couldn't find a suitable place to insert
            console.log(
              chalk.yellow(
                "⚠️  Could not find a suitable place to insert colors in the config file"
              )
            );
            return false;
          }
        }
      }
    }

    // Validate that the change was made
    if (updatedConfig === existingConfig) {
      return false;
    }

    // Write the updated configuration
    await fs.writeFile(configPath, updatedConfig);
    return true;
  } catch (error) {
    console.error("Error merging colors into existing config:", error);
    return false;
  }
}

/**
 * Detect if the project uses TypeScript for configuration
 */
async function detectTypeScriptConfig(projectPath: string): Promise<boolean> {
  try {
    // Check for existing TypeScript config files
    const tsConfigExists = await fs
      .access(path.join(projectPath, "tsconfig.json"))
      .then(() => true)
      .catch(() => false);
    const existingTsConfig = await fs
      .access(path.join(projectPath, "tailwind.config.ts"))
      .then(() => true)
      .catch(() => false);

    return tsConfigExists || existingTsConfig;
  } catch {
    return false;
  }
}

/**
 * Apply custom styles to TailwindCSS configuration based on version
 */
export async function applyCustomStyles(
  projectPath: string,
  isTailwindV4: boolean
): Promise<void> {
  try {
    if (isTailwindV4) {
      // For v4, add custom styles to the main CSS file
      // 優先搜尋 Vite 常用的 CSS 文件位置
      const cssFiles = [
        "src/index.css", // Vite + React 默認
        "src/app.css", // Vite 常用 (用戶提到的)
        "src/style.css", // Vite 默認模板
        "src/styles.css", // 常用命名
        "src/main.css", // 常用命名
        "index.css", // 根目錄
        "app.css", // 根目錄 (用戶提到的)
        "style.css", // 根目錄
        "src/app/globals.css", // Next.js App Router
        "src/styles/globals.css", // Next.js 常用
        "styles/globals.css", // Next.js 常用
        "public/globals.css", // 其他框架
        "css/main.css", // 其他框架
        "assets/css/main.css", // 其他框架
      ];

      let cssFilePath: string | null = null;

      // Find existing CSS file
      for (const file of cssFiles) {
        const fullPath = path.join(projectPath, file);
        try {
          await fs.access(fullPath);
          cssFilePath = fullPath;
          console.log(chalk.gray(`📄 Found CSS file: ${file}`));
          break;
        } catch {
          continue;
        }
      }

      // If no CSS file found, create one based on project structure
      if (!cssFilePath) {
        // 檢查是否為 Next.js 項目 (有 app 目錄)
        const hasAppDir = await fs
          .access(path.join(projectPath, "app"))
          .then(() => true)
          .catch(() => false);
        // 檢查是否有 src 目錄
        const hasSrcDir = await fs
          .access(path.join(projectPath, "src"))
          .then(() => true)
          .catch(() => false);

        if (hasAppDir) {
          // Next.js App Router
          cssFilePath = path.join(projectPath, "src/app/globals.css");
        } else if (hasSrcDir) {
          // Vite 或其他使用 src 的項目
          cssFilePath = path.join(projectPath, "src/index.css");
        } else {
          // 根目錄項目
          cssFilePath = path.join(projectPath, "index.css");
        }

        await fs.mkdir(path.dirname(cssFilePath), { recursive: true });
        console.log(
          chalk.gray(
            `📄 Will create CSS file: ${path.relative(
              projectPath,
              cssFilePath
            )}`
          )
        );
      }

      // Read existing content or create new
      let existingContent = "";
      try {
        existingContent = await fs.readFile(cssFilePath, "utf-8");
      } catch {
        // File doesn't exist, will create new
      }

      // Check if custom styles already exist
      if (existingContent.includes("@theme {")) {
        console.log(
          chalk.yellow("⚠️  Custom styles already exist in CSS file")
        );
        return;
      }

      // Check if @import "tailwindcss" exists
      const hasTailwindImport = existingContent.includes(
        '@import "tailwindcss"'
      );

      const v4Config = generateV4Config();

      let finalContent = "";

      if (existingContent.trim()) {
        if (!hasTailwindImport) {
          // Add @import at the beginning if it doesn't exist
          finalContent = `@import "tailwindcss";\n\n${existingContent}\n\n${v4Config}`;
        } else {
          // Just append the theme config
          finalContent = existingContent + "\n\n" + v4Config;
        }
      } else {
        // New file, add both import and theme
        finalContent = `@import "tailwindcss";\n\n${v4Config}`;
      }

      await fs.writeFile(cssFilePath, finalContent);

      console.log(
        chalk.green(
          `✅ Applied custom styles to ${path.relative(
            projectPath,
            cssFilePath
          )}`
        )
      );
    } else {
      // For v3, update or create tailwind.config file
      const isTypeScript = await detectTypeScriptConfig(projectPath);
      const configFileName = isTypeScript
        ? "tailwind.config.ts"
        : "tailwind.config.js";
      const configPath = path.join(projectPath, configFileName);

      // Check if config file exists
      let configExists = false;
      try {
        await fs.access(configPath);
        configExists = true;
      } catch {
        // Config file doesn't exist
      }

      if (configExists) {
        // Try to merge colors into existing config
        console.log(
          chalk.blue(
            "🔄 Merging Verza UI colors into existing Tailwind config..."
          )
        );

        const mergeSuccess = await mergeColorsIntoExistingConfig(
          configPath,
          isTypeScript
        );

        if (mergeSuccess) {
          console.log(
            chalk.green(
              `✅ Successfully merged custom colors into ${configPath}`
            )
          );
        } else {
          console.log(
            chalk.yellow(
              "⚠️  Could not automatically merge colors. Please manually add the following colors to your theme.extend.colors section:"
            )
          );

          // Display the colors that need to be added manually
          console.log(chalk.gray("\nColors to add:"));
          console.log(chalk.gray("```javascript"));
          console.log(chalk.gray(generateExampleConfig()));
          console.log(chalk.gray("```"));
        }
        return;
      }

      // Generate new config
      const v3Config = generateV3Config(isTypeScript);
      await fs.writeFile(configPath, v3Config);

      console.log(chalk.green(`✅ Applied custom styles to ${configPath}`));
    }
  } catch (error) {
    console.error("Error applying custom styles:", error);
    throw error;
  }
}

/**
 * Main function to setup Tailwind custom styles
 * This is the function called from init.ts
 */
export async function setupTailwindCustomStyles(): Promise<void> {
  const version = getTailwindVersion();
  const isV4 = isTailwindV4OrLater();
  const projectPath = process.cwd();

  console.log(chalk.blue(`🎨 Setting up Tailwind custom styles`));
  console.log(chalk.gray(`   Detected version: ${version || "Not found"}`));
  console.log(chalk.gray(`   Is v4 or later: ${isV4}`));
  console.log(
    chalk.gray(
      `   Will use: ${
        isV4 ? "v4 (@theme directive)" : "v3 (config file)"
      } configuration`
    )
  );

  try {
    await applyCustomStyles(projectPath, isV4);
  } catch (error) {
    console.error(chalk.red("❌ Failed to setup custom styles:"), error);
    throw error;
  }
}

/**
 * Get the custom color palette for reference
 */
export function getCustomColorPalette() {
  return customColorPalette;
}

/**
 * Test function for merging colors (for development/testing purposes)
 */
export async function testMergeColors(
  configContent: string,
  isTypeScript: boolean = false
): Promise<string | null> {
  const tempPath = path.join(
    process.cwd(),
    `temp-tailwind-config-${Date.now()}.js`
  );

  try {
    // Create a temporary file for testing
    await fs.writeFile(tempPath, configContent);

    const success = await mergeColorsIntoExistingConfig(tempPath, isTypeScript);

    if (success) {
      const result = await fs.readFile(tempPath, "utf-8");
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Test merge failed:", error);
    return null;
  } finally {
    // Always clean up the temporary file
    try {
      await fs.unlink(tempPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}
