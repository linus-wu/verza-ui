import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";

function detectPackageManager(): "npm" | "yarn" | "pnpm" | "bun" {
  const cwd = process.cwd();

  // Check for pnpm first (most specific)
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  // Check for yarn
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }

  // Check for bun
  if (fs.existsSync(path.join(cwd, "bun.lockb"))) {
    return "bun";
  }

  // Check for npm (package-lock.json indicates npm was used)
  if (fs.existsSync(path.join(cwd, "package-lock.json"))) {
    return "npm";
  }

  // Default to npm if no lock files found
  return "npm";
}

function getInstalledPackages(): string[] {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return [];
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const allDependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    return Object.keys(allDependencies);
  } catch (error) {
    console.log(chalk.yellow("⚠️ Could not read package.json"));
    return [];
  }
}

export const installPackages = async (packages: string[]) => {
  // Check if packages array is empty
  if (!packages || packages.length === 0) {
    console.log(chalk.gray("📦 No packages to install"));
    return;
  }

  // Filter out already installed packages
  const installedPackages = getInstalledPackages();
  const packagesToInstall = packages.filter(
    (pkg) => !installedPackages.includes(pkg)
  );

  if (packagesToInstall.length === 0) {
    console.log(chalk.green("✅ All dependencies are already installed"));
    return;
  }

  if (packagesToInstall.length < packages.length) {
    const alreadyInstalled = packages.filter((pkg) =>
      installedPackages.includes(pkg)
    );
    console.log(
      chalk.gray(`📦 Already installed: ${alreadyInstalled.join(", ")}`)
    );
  }

  console.log(
    chalk.yellow(
      `📦 Installing dependencies: ${packagesToInstall.join(" ")}...`
    )
  );

  const packageManager = detectPackageManager();
  let command: string;

  switch (packageManager) {
    case "yarn":
      command = `yarn add ${packagesToInstall.join(" ")}`;
      break;
    case "pnpm":
      command = `pnpm add ${packagesToInstall.join(" ")}`;
      break;
    case "bun":
      command = `bun add ${packagesToInstall.join(" ")}`;
      break;
    case "npm":
    default:
      command = `npm install ${packagesToInstall.join(" ")} --save`;
      break;
  }

  try {
    console.log(chalk.gray(`Using ${packageManager} to install...`));
    execSync(command, { stdio: "inherit", cwd: process.cwd() });
    console.log(chalk.green("✅ Dependencies installed successfully!"));
  } catch (error) {
    console.error(chalk.red("❌ Failed to install dependencies"));

    if (error instanceof Error) {
      console.log(chalk.gray(`Error: ${error.message}`));
    }

    console.log(chalk.yellow("\n💡 Troubleshooting tips:"));
    console.log(chalk.gray("• Make sure you have internet connection"));
    console.log(chalk.gray("• Check if the package names are correct"));
    console.log(chalk.gray(`• Try running: ${command}`));
    console.log(chalk.gray("• Clear your package manager cache if needed"));

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
