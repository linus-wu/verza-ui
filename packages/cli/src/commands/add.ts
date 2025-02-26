import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { REPO_BASE_URL } from "../constants";
import { downloadFile, loadVerzaConfig } from "../utils";

export async function addComponent(target: string) {
  if (!target) {
    console.error(
      "Please provide a component name, e.g., `npx verza-ui@latest add Button`."
    );
    process.exit(1);
  }

  try {
    console.log(chalk.cyan("Adding component ..."));

    const verzaConfig = loadVerzaConfig();
    const isTypeScriptProject = fs.existsSync(
      path.join(process.cwd(), "tsconfig.json")
    );
    const language = isTypeScriptProject ? "ts" : "js";

    const baseComponentPath = path.join(
      process.cwd(),
      verzaConfig.paths.components
    );

    await fs.ensureDir(baseComponentPath);

    const repoBaseURL = REPO_BASE_URL;
    const fileName = `${target}.${language === "ts" ? "tsx" : "jsx"}`;
    const repoUrl = `${repoBaseURL}/${language}/${fileName}`;

    const outputPath = path.join(baseComponentPath, fileName);

    console.log(chalk.gray(`Downloading from: ${repoUrl}`));
    console.log(chalk.gray(`Saving to: ${outputPath}`));

    await downloadFile(repoUrl, outputPath);

    console.log(chalk.green(`Component added successfully: ${outputPath}`));
  } catch (error) {
    console.error(chalk.red(`Failed to add component: ${error}`));
    process.exit(1);
  }
}
