import chalk from "chalk";
import { installPackages } from "../installPackages";
import { writeJsonFile } from "../fileUtils";

const PRETTIER_PACKAGES = ["prettier", "prettier-plugin-tailwindcss"];

export async function setupTailwindPrettier(): Promise<void> {
  console.log(chalk.blue("📝 Setting up Tailwind CSS Prettier..."));

  await installPackages(PRETTIER_PACKAGES);

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
