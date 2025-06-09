import chalk from "chalk";
import inquirer from "inquirer";
import { setupPathAliases } from "./pathAliases";
import {
  hasTailwindInstalled,
  hasTailwindPrettierSetup,
  setupTailwindForNextjs,
  setupTailwindPrettier,
  getTailwindVersion,
  isTailwindV4OrLater,
  setupTailwindCustomStyles,
} from "./tailwind";
import { checkPathAliasesSetup, checkExistingDirectories } from "./validators";
import {
  getPathConfiguration,
  createVerzaConfig,
  DOCUMENTATION_LINKS,
} from "./configManager";

const ADDITIONAL_DOCS = {
  colors: "https://verza-ui.com/docs/theming/colors",
  manualColors: "https://verza-ui.com/docs/installation/manual#colors",
} as const;

export async function handleNextjsProject(): Promise<void> {
  console.log(chalk.cyan("🚀 Starting setup..."));

  const tailwindSetup = await checkAndSetupTailwind();

  await setupPathAliases();

  const paths = await getPathConfiguration();

  const verzaConfig = createVerzaConfig(paths);

  await checkExistingDirectories(verzaConfig);

  if (tailwindSetup.shouldInstall) {
    await setupTailwindForNextjs();
  }

  if (tailwindSetup.shouldSetupColors) {
    await setupTailwindCustomStyles();
  }

  if (tailwindSetup.shouldSetupPrettier) {
    await setupTailwindPrettier();
  }

  console.log(chalk.green("🎉 Verza UI initialized successfully!"));
  console.log(chalk.cyan("\n💡 Next steps:"));
  console.log(chalk.gray("  • Add components: npx verza-ui add button"));
  console.log(chalk.gray("  • List available modules: npx verza-ui add list"));
  console.log(chalk.gray("  • Check documentation for usage examples"));

  const isV4 = isTailwindV4OrLater();
  if (!isV4 && !tailwindSetup.shouldSetupColors) {
    console.log(chalk.cyan("\n🎨 Custom Color System:"));
    console.log(
      chalk.gray(
        "  For TailwindCSS v3 projects, you can manually setup custom colors:"
      )
    );
    console.log(chalk.gray(`  • Documentation: ${ADDITIONAL_DOCS.colors}`));
    console.log(
      chalk.gray(`  • Configuration guide: ${ADDITIONAL_DOCS.manualColors}`)
    );
  }
}

export async function handleNonNextjsProject(): Promise<void> {
  console.log(chalk.cyan("📋 Checking requirements..."));

  const hasTailwind = hasTailwindInstalled();
  console.log(
    chalk.gray(
      `   TailwindCSS: ${hasTailwind ? "✅ Installed" : "❌ Not found"}`
    )
  );

  const hasPathAliases = await checkPathAliasesSetup();
  console.log(
    chalk.gray(
      `   Path aliases: ${
        hasPathAliases ? "✅ Configured" : "❌ Not configured"
      }`
    )
  );

  if (hasTailwind && hasPathAliases) {
    console.log(chalk.cyan("✅ Requirements met! Starting setup..."));
    await setupVerzaForNonNextjs();
  } else {
    await showSimpleManualSetupGuide(hasTailwind, hasPathAliases);
  }
}

async function setupVerzaForNonNextjs(): Promise<void> {
  // Detect TailwindCSS version
  const isV4 = isTailwindV4OrLater();

  // Decide whether to ask about custom color system based on version
  const questions: any[] = [
    {
      type: "confirm",
      name: "shouldSetupPrettier",
      message: "Do you want to setup TailwindCSS Prettier plugin?",
      default: true,
    },
  ];

  // Only ask about custom color system for v4+
  if (isV4) {
    questions.unshift({
      type: "confirm",
      name: "shouldSetupColors",
      message: "Do you want to setup Verza UI custom color system?",
      default: true,
    });
  }

  const answers = await inquirer.prompt(questions);

  const paths = await getPathConfiguration();

  // Create configuration file
  const verzaConfig = createVerzaConfig(paths);

  // Check existing directories
  await checkExistingDirectories(verzaConfig);

  // Setup Tailwind related features
  if (isV4 && answers.shouldSetupColors) {
    await setupTailwindCustomStyles();
  }

  if (answers.shouldSetupPrettier) {
    await setupTailwindPrettier();
  }

  console.log(chalk.green("🎉 Verza UI configuration completed!"));
  console.log(chalk.cyan("\n💡 Next steps:"));
  console.log(chalk.gray("  • List available modules: npx verza-ui add list"));
  console.log(chalk.gray("  • Add components: npx verza-ui add <module>"));

  // For versions before v4, show custom color setup documentation
  if (!isV4) {
    console.log(chalk.cyan("\n🎨 Custom Color System:"));
    console.log(
      chalk.gray(
        "  For TailwindCSS v3 projects, you can manually setup custom colors:"
      )
    );
    console.log(chalk.gray(`  • Documentation: ${ADDITIONAL_DOCS.colors}`));
    console.log(
      chalk.gray(`  • Configuration guide: ${ADDITIONAL_DOCS.manualColors}`)
    );
  }
}

/**
 * Show simple manual setup guide
 */
async function showSimpleManualSetupGuide(
  hasTailwind: boolean,
  hasPathAliases: boolean
): Promise<void> {
  console.log(
    chalk.yellow("⚠️  Some requirements are missing for automatic setup")
  );

  if (!hasTailwind) {
    console.log(chalk.red("   • TailwindCSS is not installed"));
  }

  if (!hasPathAliases) {
    console.log(chalk.red("   • Path aliases are not configured"));
  }

  console.log(chalk.cyan("\n📖 Please complete the setup manually:"));
  console.log(chalk.gray(`   • Documentation: ${DOCUMENTATION_LINKS.main}`));
  console.log(
    chalk.gray(`   • React + Vite guide: ${DOCUMENTATION_LINKS.vite}`)
  );
  console.log(
    chalk.gray(`   • Manual setup guide: ${DOCUMENTATION_LINKS.manual}`)
  );

  console.log(chalk.cyan("\n🔧 Required setup steps:"));
  if (!hasTailwind) {
    console.log(chalk.gray("   1. Install and configure TailwindCSS"));
    console.log(
      chalk.gray("      npm install -D tailwindcss postcss autoprefixer")
    );
    console.log(chalk.gray("      npx tailwindcss init -p"));
  }
  if (!hasPathAliases) {
    console.log(
      chalk.gray("   2. Configure path aliases in tsconfig.json/jsconfig.json:")
    );
    console.log(chalk.gray('      "paths": { "@/*": ["./src/*"] }'));
  }
  console.log(
    chalk.gray("   3. Run 'npx verza-ui init' again after completing the setup")
  );

  console.log(chalk.green("\n✨ After setup completion, you'll be able to:"));
  console.log(chalk.gray("   • Add components: npx verza-ui add button"));
  console.log(chalk.gray("   • List available modules: npx verza-ui add list"));
}

/**
 * Check and setup TailwindCSS
 */
async function checkAndSetupTailwind(): Promise<{
  shouldInstall: boolean;
  shouldSetupColors: boolean;
  shouldSetupPrettier: boolean;
}> {
  const hasTailwind = hasTailwindInstalled();

  if (!hasTailwind) {
    console.log(chalk.yellow("⚠️  TailwindCSS is not installed"));

    const { shouldInstall } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldInstall",
        message: "Do you want to install and configure TailwindCSS?",
        default: true,
      },
    ]);

    if (!shouldInstall) {
      console.log(
        chalk.cyan(
          "ℹ️  You can install TailwindCSS later and rerun this command"
        )
      );
      return {
        shouldInstall: false,
        shouldSetupColors: false,
        shouldSetupPrettier: false,
      };
    }

    // If installing TailwindCSS, will install latest version (v4+) by default, so ask about custom colors
    const answers = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldSetupColors",
        message: "Do you want to setup Verza UI custom color system?",
        default: true,
      },
      {
        type: "confirm",
        name: "shouldSetupPrettier",
        message: "Do you want to setup TailwindCSS Prettier plugin?",
        default: true,
      },
    ]);

    return {
      shouldInstall: true,
      shouldSetupColors: answers.shouldSetupColors,
      shouldSetupPrettier: answers.shouldSetupPrettier,
    };
  } else {
    // TailwindCSS is already installed, check version
    const isV4 = isTailwindV4OrLater();

    const questions: any[] = [
      {
        type: "confirm",
        name: "shouldSetupPrettier",
        message: "Do you want to setup TailwindCSS Prettier plugin?",
        default: !hasTailwindPrettierSetup(),
      },
    ];

    // Only ask about custom color system for v4+
    if (isV4) {
      questions.unshift({
        type: "confirm",
        name: "shouldSetupColors",
        message: "Do you want to setup Verza UI custom color system?",
        default: true,
      });
    }

    const answers = await inquirer.prompt(questions);

    return {
      shouldInstall: false,
      shouldSetupColors: isV4 ? answers.shouldSetupColors : false,
      shouldSetupPrettier: answers.shouldSetupPrettier,
    };
  }
}
