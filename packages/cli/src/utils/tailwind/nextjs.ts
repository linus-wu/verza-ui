import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { installPackages } from "../packageInstaller";
import { checkFileExists } from "../fileHelper";

const TAILWIND_NEXTJS_PACKAGES = [
  "tailwindcss",
  "@tailwindcss/postcss",
  "postcss",
];

export async function setupTailwindForNextjs(): Promise<void> {
  console.log(chalk.cyan("🌬️ Setting up Tailwind CSS for Next.js..."));

  await installPackages(TAILWIND_NEXTJS_PACKAGES);

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

  const appDir = path.join(process.cwd(), "src", "app");
  const srcStylesDir = path.join(process.cwd(), "src", "styles");
  const rootStylesDir = path.join(process.cwd(), "styles");

  let globalCssPath = "";

  if (checkFileExists("src/app/globals.css")) {
    globalCssPath = path.join(appDir, "globals.css");
  } else if (checkFileExists("src/styles/globals.css")) {
    globalCssPath = path.join(srcStylesDir, "globals.css");
  } else if (checkFileExists("styles/globals.css")) {
    globalCssPath = path.join(rootStylesDir, "globals.css");
  } else {
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

  let cssContent = "";
  if (fs.existsSync(globalCssPath)) {
    cssContent = fs.readFileSync(globalCssPath, "utf8");
  }

  if (!cssContent.includes('@import "tailwindcss"')) {
    cssContent = `@import "tailwindcss";\n\n${cssContent}`;
    fs.writeFileSync(globalCssPath, cssContent, "utf8");
  }

  console.log(chalk.green("✅ TailwindCSS configured for Next.js"));
}
