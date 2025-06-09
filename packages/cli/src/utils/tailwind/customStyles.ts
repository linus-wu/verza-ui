import { promises as fs } from "fs";
import path from "path";
import chalk from "chalk";
import { isTailwindV4OrLater, getTailwindVersion } from "./detect";

// Enhanced custom color palette for the design system
const customColorPalette = {
  primary: {
    50: "#F1F2F3",
    100: "#E1E4EA",
    200: "#C5CDDD",
    300: "#9FB3DB",
    400: "#7296DF",
    500: "#427EF5",
    600: "#0B5CFE",
    700: "#0049DA",
    800: "#0039AB",
    900: "#002A7C",
    950: "#001A4E",
  },

  secondary: {
    50: "#F1F3F3",
    100: "#E1E9EA",
    200: "#C6DADC",
    300: "#A2D1D8",
    400: "#77CEDA",
    500: "#37D6EB",
    600: "#0CD0EA",
    700: "#02B2C9",
    800: "#008DA0",
    900: "#006674",
    950: "#004049",
  },

  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
    800: "#166534",
    900: "#14532D",
  },

  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
  },

  text: {
    primary: "#111827",
    secondary: "#6B7280",
    muted: "#9CA3AF",
    inverse: "#FFFFFF",
  },

  background: {
    primary: "#FFFFFF",
    secondary: "#F9FAFB",
    elevated: "#FFFFFF",
  },

  border: {
    default: "#E5E7EB",
    focus: "#3B82F6",
  },
};

function generateV4Config(): string {
  return `
/* Verza UI Custom Color System */
/* Go to https://verza-ui.com/docs/customization/colors for more information */
@theme {
  --color-primary-50: ${customColorPalette.primary[50]};
  --color-primary-100: ${customColorPalette.primary[100]};
  --color-primary-200: ${customColorPalette.primary[200]};
  --color-primary-300: ${customColorPalette.primary[300]};
  --color-primary-400: ${customColorPalette.primary[400]};
  --color-primary-500: ${customColorPalette.primary[500]};
  --color-primary-600: ${customColorPalette.primary[600]};
  --color-primary-700: ${customColorPalette.primary[700]};
  --color-primary-800: ${customColorPalette.primary[800]};
  --color-primary-900: ${customColorPalette.primary[900]};
  --color-primary-950: ${customColorPalette.primary[950]};
  
  --color-secondary-50: ${customColorPalette.secondary[50]};
  --color-secondary-100: ${customColorPalette.secondary[100]};
  --color-secondary-200: ${customColorPalette.secondary[200]};
  --color-secondary-300: ${customColorPalette.secondary[300]};
  --color-secondary-400: ${customColorPalette.secondary[400]};
  --color-secondary-500: ${customColorPalette.secondary[500]};
  --color-secondary-600: ${customColorPalette.secondary[600]};
  --color-secondary-700: ${customColorPalette.secondary[700]};
  --color-secondary-800: ${customColorPalette.secondary[800]};
  --color-secondary-900: ${customColorPalette.secondary[900]};
  --color-secondary-950: ${customColorPalette.secondary[950]};
  
  --color-success-50: ${customColorPalette.success[50]};
  --color-success-100: ${customColorPalette.success[100]};
  --color-success-200: ${customColorPalette.success[200]};
  --color-success-300: ${customColorPalette.success[300]};
  --color-success-400: ${customColorPalette.success[400]};
  --color-success-500: ${customColorPalette.success[500]};
  --color-success-600: ${customColorPalette.success[600]};
  --color-success-700: ${customColorPalette.success[700]};
  --color-success-800: ${customColorPalette.success[800]};
  --color-success-900: ${customColorPalette.success[900]};
  
  --color-warning-50: ${customColorPalette.warning[50]};
  --color-warning-100: ${customColorPalette.warning[100]};
  --color-warning-200: ${customColorPalette.warning[200]};
  --color-warning-300: ${customColorPalette.warning[300]};
  --color-warning-400: ${customColorPalette.warning[400]};
  --color-warning-500: ${customColorPalette.warning[500]};
  --color-warning-600: ${customColorPalette.warning[600]};
  --color-warning-700: ${customColorPalette.warning[700]};
  --color-warning-800: ${customColorPalette.warning[800]};
  --color-warning-900: ${customColorPalette.warning[900]};
  
  --color-error-50: ${customColorPalette.error[50]};
  --color-error-100: ${customColorPalette.error[100]};
  --color-error-200: ${customColorPalette.error[200]};
  --color-error-300: ${customColorPalette.error[300]};
  --color-error-400: ${customColorPalette.error[400]};
  --color-error-500: ${customColorPalette.error[500]};
  --color-error-600: ${customColorPalette.error[600]};
  --color-error-700: ${customColorPalette.error[700]};
  --color-error-800: ${customColorPalette.error[800]};
  --color-error-900: ${customColorPalette.error[900]};
  
  --color-text-primary: ${customColorPalette.text.primary};
  --color-text-secondary: ${customColorPalette.text.secondary};
  --color-text-muted: ${customColorPalette.text.muted};
  --color-text-inverse: ${customColorPalette.text.inverse};
  
  --color-background-primary: ${customColorPalette.background.primary};
  --color-background-secondary: ${customColorPalette.background.secondary};
  --color-background-elevated: ${customColorPalette.background.elevated};
  
  --color-border-default: ${customColorPalette.border.default};
  --color-border-focus: ${customColorPalette.border.focus};
}`;
}

/**
 * Check if file content contains TailwindCSS related imports
 */
function hasTailwindImports(content: string): boolean {
  const tailwindImports = [
    // v4 import syntax
    '@import "tailwindcss"',
    "@import 'tailwindcss'",
    '@import "tailwindcss";',
    "@import 'tailwindcss';",

    // v3 layered imports
    '@import "tailwindcss/base"',
    '@import "tailwindcss/components"',
    '@import "tailwindcss/utilities"',
    "@import 'tailwindcss/base'",
    "@import 'tailwindcss/components'",
    "@import 'tailwindcss/utilities'",

    // v3 @tailwind directives
    "@tailwind base",
    "@tailwind components",
    "@tailwind utilities",

    // Other possible variants
    '@import url("tailwindcss")',
    "@import url('tailwindcss')",
    '@import url("tailwindcss/base")',

    // Preprocessor syntax (Sass/SCSS)
    '@use "tailwindcss"',
    "@use 'tailwindcss'",
    '@forward "tailwindcss"',
    "@forward 'tailwindcss'",

    // Less syntax
    '@import (css) "tailwindcss"',
    "@import (css) 'tailwindcss'",
  ];

  // Normalize content (remove extra whitespace and newlines)
  const normalizedContent = content.replace(/\s+/g, " ").toLowerCase();

  return tailwindImports.some((importStatement) => {
    const normalizedImport = importStatement.toLowerCase();
    return normalizedContent.includes(normalizedImport);
  });
}

/**
 * Smart search for CSS files containing TailwindCSS imports
 */
async function findTailwindCSSFile(
  projectPath: string
): Promise<string | null> {
  // Common CSS file locations (ordered by priority)
  const priorityFiles = [
    "src/app/globals.css",
    "src/styles/globals.css",
    "styles/globals.css",
    "src/styles.css", // Common naming
    "src/main.css", // Common naming
    "index.css", // Root directory
    "app.css", // Root directory
    "style.css", // Root directory
    "src/index.css",
    "src/app.css",
    "public/globals.css", // Other frameworks
    "css/main.css", // Other frameworks
    "assets/css/main.css", // Other frameworks
  ];

  // Step 1: Check priority file list
  for (const file of priorityFiles) {
    const fullPath = path.join(projectPath, file);
    try {
      const content = await fs.readFile(fullPath, "utf-8");

      if (hasTailwindImports(content)) {
        return fullPath;
      }
    } catch {
      // File doesn't exist, continue to next one
      continue;
    }
  }

  // Step 2: Search all style files
  console.log(chalk.gray("🔍 Searching for CSS files in project..."));

  try {
    const allCssFiles = await findAllCSSFiles(projectPath);

    for (const cssFile of allCssFiles) {
      try {
        const content = await fs.readFile(cssFile, "utf-8");

        if (hasTailwindImports(content)) {
          const relativePath = path.relative(projectPath, cssFile);
          console.log(chalk.gray(`📄 Found TailwindCSS file: ${relativePath}`));
          return cssFile;
        }
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.log(chalk.yellow("⚠️ Could not search for CSS files"));
  }

  console.log(chalk.yellow("⚠️ No TailwindCSS file found"));
  return null;
}

/**
 * Recursively search for all CSS-related files in the project
 */
async function findAllCSSFiles(
  dir: string,
  maxDepth: number = 3,
  currentDepth: number = 0
): Promise<string[]> {
  if (currentDepth >= maxDepth) return [];

  const cssFiles: string[] = [];
  const cssExtensions = [".css", ".scss", ".sass", ".less", ".styl", ".stylus"];
  const excludedDirs = [
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    ".nuxt",
    ".output",
    "coverage",
    ".nyc_output",
    ".cache",
    "tmp",
    "temp",
  ];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    // Process files first, then directories (performance optimization)
    const files = entries.filter((entry) => entry.isFile());
    const directories = entries.filter((entry) => entry.isDirectory());

    // Check current directory for style files
    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      if (cssExtensions.includes(ext)) {
        cssFiles.push(path.join(dir, file.name));
      }
    }

    // Recursively check subdirectories
    for (const directory of directories) {
      if (
        !excludedDirs.includes(directory.name) &&
        !directory.name.startsWith(".")
      ) {
        const fullPath = path.join(dir, directory.name);
        const nestedFiles = await findAllCSSFiles(
          fullPath,
          maxDepth,
          currentDepth + 1
        );
        cssFiles.push(...nestedFiles);
      }
    }
  } catch {
    // Ignore permission errors etc
  }

  return cssFiles;
}

/**
 * Decide the best CSS file creation location based on project structure
 */
async function decideBestCSSLocation(projectPath: string): Promise<string> {
  // Check if it's a Next.js project (has app directory)
  const hasAppDir = await fs
    .access(path.join(projectPath, "app"))
    .then(() => true)
    .catch(() => false);

  // Check if there's a src directory
  const hasSrcDir = await fs
    .access(path.join(projectPath, "src"))
    .then(() => true)
    .catch(() => false);

  if (hasAppDir) {
    // Next.js App Router
    return path.join(projectPath, "app/globals.css");
  } else if (hasSrcDir) {
    // Vite or other projects using src
    return path.join(projectPath, "src/index.css");
  } else {
    // Root directory project
    return path.join(projectPath, "index.css");
  }
}

/**
 * Apply custom styles to TailwindCSS v4 configuration
 */
export async function applyCustomStyles(projectPath: string): Promise<void> {
  try {
    let cssFilePath = await findTailwindCSSFile(projectPath);

    // If no TailwindCSS file found, create one based on project structure
    if (!cssFilePath) {
      cssFilePath = await decideBestCSSLocation(projectPath);
      await fs.mkdir(path.dirname(cssFilePath), { recursive: true });
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
      return;
    }

    // Check if @import "tailwindcss" exists
    const hasTailwindImport = existingContent.includes('@import "tailwindcss"');

    const v4Config = generateV4Config();

    let finalContent = "";

    if (existingContent.trim()) {
      if (!hasTailwindImport) {
        // Add @import at the beginning if it doesn't exist
        finalContent = `@import "tailwindcss";\n\n${existingContent}\n${v4Config}`;
      } else {
        // Just append the theme config
        finalContent = existingContent + "\n" + v4Config;
      }
    } else {
      // New file, add both import and theme
      finalContent = `@import "tailwindcss";\n\n${v4Config}`;
    }

    await fs.writeFile(cssFilePath, finalContent);

    console.log(chalk.green(`✅ Custom colors configured`));
  } catch (error) {
    console.error("Error applying custom styles:", error);
    throw error;
  }
}

/**
 * Main function to setup Tailwind custom styles for v4
 */
export async function setupTailwindCustomStyles(): Promise<void> {
  const version = getTailwindVersion();
  const isV4 = isTailwindV4OrLater();
  const projectPath = process.cwd();

  if (!isV4) {
    console.log(
      chalk.yellow("⚠️  TailwindCSS v4 is required for custom colors")
    );
    return;
  }

  console.log(chalk.cyan(`🎨 Setting up custom colors...`));

  try {
    await applyCustomStyles(projectPath);
  } catch (error) {
    console.error(chalk.red("❌ Failed to setup custom colors:"), error);
    throw error;
  }
}

/**
 * Get the custom color palette for reference
 */
export function getCustomColorPalette() {
  return customColorPalette;
}
