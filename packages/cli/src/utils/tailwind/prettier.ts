import chalk from "chalk";
import { installPackages } from "../packageInstaller";
import { writeJsonFile } from "../fileHelper";

const PRETTIER_PACKAGES = ["prettier", "prettier-plugin-tailwindcss"];

export async function setupTailwindPrettier(): Promise<void> {
  console.log(chalk.cyan("📝 Setting up Prettier..."));

  await installPackages(PRETTIER_PACKAGES);

  const prettierConfig = {
    plugins: ["prettier-plugin-tailwindcss"],
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
  };

  writeJsonFile(".prettierrc", prettierConfig);

  console.log(chalk.green("✅ Prettier configured"));
}
