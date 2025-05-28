import axios from "axios";
import chalk from "chalk";
import { REGISTRY_JSON_URL } from "../config";
import { RegistryResponse, ModuleInfo } from "../types";

export async function fetchRegistry(): Promise<RegistryResponse> {
  console.log(chalk.gray("Fetching components list..."));

  try {
    const response = await axios.get<RegistryResponse>(REGISTRY_JSON_URL, {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    });
    return response.data;
  } catch (apiError) {
    console.log(
      chalk.yellow("⚠️ Registry not available from GitHub, using fallback...")
    );
    if (axios.isAxiosError(apiError)) {
      console.log(chalk.gray(`   Reason: ${apiError.message}`));
    }
    return getFallbackModulesList();
  }
}

export async function fetchModuleInfo(
  moduleName: string
): Promise<ModuleInfo | null> {
  try {
    const registry = await fetchRegistry();

    // Search all types of modules
    const allModules = [
      ...registry.components,
      ...registry.hooks,
      ...registry.utils,
    ];

    return (
      allModules.find(
        (module) => module.name.toLowerCase() === moduleName.toLowerCase()
      ) || null
    );
  } catch (error) {
    console.error(
      chalk.red(`Failed to fetch component info for ${moduleName}:`),
      error
    );
    return null;
  }
}

export async function validateModule(moduleName: string): Promise<boolean> {
  const moduleInfo = await fetchModuleInfo(moduleName);
  return moduleInfo !== null;
}

export async function fetchModulesByCategory(
  category: "components" | "hooks" | "utils"
): Promise<ModuleInfo[]> {
  try {
    const registry = await fetchRegistry();
    return registry[category];
  } catch (error) {
    console.error(chalk.red(`Failed to fetch ${category}:`), error);
    return [];
  }
}

export async function getAllModules(): Promise<ModuleInfo[]> {
  try {
    const registry = await fetchRegistry();
    return [...registry.components, ...registry.hooks, ...registry.utils];
  } catch (error) {
    console.error(chalk.red("Failed to fetch all modules:"), error);
    return [];
  }
}

function getFallbackModulesList(): RegistryResponse {
  return {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    components: [
      {
        name: "Button",
        category: "components",
        description: "Button component",
        version: "1.0.0",
        files: ["components/button/Button.tsx"],
        dependencies: {
          external: [],
          internal: ["cn"],
        },
      },
      {
        name: "Input",
        category: "components",
        description: "Input component",
        version: "1.0.0",
        files: ["components/input/Input.tsx"],
        dependencies: {
          external: [],
          internal: ["cn"],
        },
      },
      {
        name: "Select",
        category: "components",
        description: "Select component",
        version: "1.0.0",
        files: ["components/select/Select.tsx"],
        dependencies: {
          external: [],
          internal: ["cn"],
        },
      },
    ],
    hooks: [
      {
        name: "useToggle",
        category: "hooks",
        description: "useToggle hook",
        version: "1.0.0",
        files: ["hooks/useToggle/useToggle.ts"],
        dependencies: {
          external: [],
          internal: [],
        },
      },
    ],
    utils: [
      {
        name: "cn",
        category: "utils",
        description: "cn util",
        version: "1.0.0",
        files: ["utils/cn/cn.ts"],
        dependencies: {
          external: ["clsx", "tailwind-merge"],
          internal: [],
        },
      },
    ],
  };
}

export async function listAvailableModules(): Promise<void> {
  try {
    const registry = await fetchRegistry();

    // Display Components
    if (registry.components.length > 0) {
      console.log(chalk.cyan("\n📦 Available Components:\n"));
      registry.components.forEach((component) => {
        console.log(chalk.white(`  ${component.name}`));
        if (component.description) {
          console.log(chalk.gray(`    ${component.description}`));
        }
        console.log(
          chalk.gray(
            `    Category: ${component.category} | Version: ${component.version}`
          )
        );
        console.log();
      });
    }

    // Display Hooks
    if (registry.hooks.length > 0) {
      console.log(chalk.cyan("\n🪝 Available Hooks:\n"));
      registry.hooks.forEach((hook) => {
        console.log(chalk.white(`  ${hook.name}`));
        if (hook.description) {
          console.log(chalk.gray(`    ${hook.description}`));
        }
        console.log(
          chalk.gray(
            `    Category: ${hook.category} | Version: ${hook.version}`
          )
        );
        console.log();
      });
    }

    // Display Utils
    if (registry.utils.length > 0) {
      console.log(chalk.cyan("\n🔧 Available Utils:\n"));
      registry.utils.forEach((util) => {
        console.log(chalk.white(`  ${util.name}`));
        if (util.description) {
          console.log(chalk.gray(`    ${util.description}`));
        }
        console.log(
          chalk.gray(
            `    Category: ${util.category} | Version: ${util.version}`
          )
        );
        console.log();
      });
    }

    const totalModules =
      registry.components.length +
      registry.hooks.length +
      registry.utils.length;
    console.log(
      chalk.gray(
        `Total: ${totalModules} modules available (${registry.components.length} components, ${registry.hooks.length} hooks, ${registry.utils.length} utils)`
      )
    );
    console.log(chalk.gray("Usage: npx verza-ui add <module-name>"));
  } catch (error) {
    console.error(chalk.red("Failed to list modules"));
  }
}
