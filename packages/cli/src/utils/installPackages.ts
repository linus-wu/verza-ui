import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";

function detectPackageManager(): "npm" | "yarn" | "pnpm" {
  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (fs.existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }

  return "npm";
}

export const installPackages = async (packages: string[]) => {
  console.log(
    chalk.yellow(`📦 Installing dependencies: ${packages.join(" ")}...`)
  );

  const packageManager = detectPackageManager();
  let command: string;

  switch (packageManager) {
    case "yarn":
      command = `yarn add ${packages.join(" ")}`;
      break;
    case "pnpm":
      command = `pnpm add ${packages.join(" ")}`;
      break;
    case "npm":
    default:
      command = `npm install ${packages.join(" ")} --save`;
      break;
  }

  try {
    console.log(chalk.gray(`Using ${packageManager} to install...`));
    execSync(command, { stdio: "inherit" });
    console.log(chalk.green("✅ Dependencies installed successfully!"));
  } catch (error) {
    console.error(chalk.red("❌ Failed to install dependencies"), error);

    const { shouldContinue } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldContinue",
        message: "Installation failed. Do you want to continue?",
        default: false,
      },
    ]);

    if (!shouldContinue) {
      process.exit(1);
    }
  }
};
