import chalk from "chalk";
import { hasTailwindInstalled, hasTailwindPrettierSetup } from "./detect";
import { setupTailwindForNextjs } from "./nextjs";
import { setupTailwindForVite } from "./vite";
import { setupTailwindPrettier } from "./prettier";

export {
  hasTailwindInstalled,
  hasTailwindPrettierSetup,
  setupTailwindForNextjs,
  setupTailwindForVite,
  setupTailwindPrettier,
};

export async function setupTailwind(frameworkType: string): Promise<void> {
  if (frameworkType === "nextjs") {
    return setupTailwindForNextjs();
  } else if (frameworkType === "vite-react" || frameworkType === "vite") {
    return setupTailwindForVite();
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
    return Promise.resolve();
  }
}
