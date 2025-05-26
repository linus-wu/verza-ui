import chalk from "chalk";
import { hasTailwindInstalled, hasTailwindPrettierSetup } from "./detect";
import { setupTailwindForNextjs } from "./nextjs";
import { setupTailwindForVite } from "./vite";
import { setupTailwindPrettier } from "./prettier";
import { getFrameworkDetectionInfo } from "../fileUtils";

export {
  hasTailwindInstalled,
  hasTailwindPrettierSetup,
  setupTailwindForNextjs,
  setupTailwindForVite,
  setupTailwindPrettier,
};

export async function setupTailwind(frameworkType: string): Promise<void> {
  const detectionInfo = getFrameworkDetectionInfo();

  console.log(chalk.blue(`🔍 Detected framework: ${frameworkType}`));

  if (frameworkType === "unknown") {
    console.log(chalk.gray("📋 Detection details:"));
    console.log(
      chalk.gray(
        `   Config files found: ${
          detectionInfo.detectedFiles.length > 0
            ? detectionInfo.detectedFiles.join(", ")
            : "none"
        }`
      )
    );
    console.log(
      chalk.gray(
        `   Dependencies found: ${
          detectionInfo.detectedDependencies.length > 0
            ? detectionInfo.detectedDependencies.join(", ")
            : "none"
        }`
      )
    );
  }

  if (frameworkType === "nextjs") {
    return setupTailwindForNextjs();
  } else if (frameworkType === "vite-react" || frameworkType === "vite") {
    return setupTailwindForVite();
  } else if (frameworkType === "create-react-app") {
    console.log(
      chalk.yellow(
        "⚠️ Create React App detected. Please install Tailwind CSS manually."
      )
    );
    console.log(
      chalk.gray(
        "Follow the official guide: https://tailwindcss.com/docs/guides/create-react-app"
      )
    );
    return Promise.resolve();
  } else if (frameworkType === "unknown") {
    console.log(
      chalk.yellow(
        "⚠️ Could not detect framework type. Please install Tailwind CSS manually."
      )
    );
    console.log(
      chalk.gray("Supported frameworks: Next.js, Vite, Create React App")
    );
    console.log(
      chalk.gray(
        "Visit https://tailwindcss.com/docs/installation for installation instructions."
      )
    );
    return Promise.resolve();
  } else {
    console.log(
      chalk.yellow(
        `⚠️ Framework "${frameworkType}" is not yet supported for automatic Tailwind setup.`
      )
    );
    console.log(
      chalk.gray("Supported frameworks: Next.js, Vite, Create React App")
    );
    console.log(
      chalk.gray(
        "Visit https://tailwindcss.com/docs/installation for installation instructions."
      )
    );
    return Promise.resolve();
  }
}
