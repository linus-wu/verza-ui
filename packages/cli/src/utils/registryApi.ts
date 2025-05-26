import axios from "axios";
import chalk from "chalk";
import { REGISTRY_JSON_URL } from "../config";

export interface ComponentInfo {
  name: string;
  category: "components" | "hooks" | "utils";
  description?: string;
  version: string;
  files: string[];
  dependencies: {
    external: string[];
    internal: string[];
  };
}

export interface RegistryResponse {
  version: string;
  lastUpdated: string;
  components: ComponentInfo[];
  hooks: ComponentInfo[];
  utils: ComponentInfo[];
}

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
    return getFallbackItemsList();
  }
}

export async function fetchItemInfo(
  itemName: string
): Promise<ComponentInfo | null> {
  try {
    const registry = await fetchRegistry();

    // 搜尋所有類型的項目
    const allItems = [
      ...registry.components,
      ...registry.hooks,
      ...registry.utils,
    ];

    return (
      allItems.find(
        (item) => item.name.toLowerCase() === itemName.toLowerCase()
      ) || null
    );
  } catch (error) {
    console.error(
      chalk.red(`Failed to fetch component info for ${itemName}:`),
      error
    );
    return null;
  }
}

export async function validateItem(itemName: string): Promise<boolean> {
  const itemInfo = await fetchItemInfo(itemName);
  return itemInfo !== null;
}

export async function fetchItemsByCategory(
  category: "components" | "hooks" | "utils"
): Promise<ComponentInfo[]> {
  try {
    const registry = await fetchRegistry();
    return registry[category];
  } catch (error) {
    console.error(chalk.red(`Failed to fetch ${category}:`), error);
    return [];
  }
}

export async function getAllItems(): Promise<ComponentInfo[]> {
  try {
    const registry = await fetchRegistry();
    return [...registry.components, ...registry.hooks, ...registry.utils];
  } catch (error) {
    console.error(chalk.red("Failed to fetch all items:"), error);
    return [];
  }
}

function getFallbackItemsList(): RegistryResponse {
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
          internal: [],
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
          internal: [],
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
          internal: [],
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

export async function listAvailableItems(): Promise<void> {
  try {
    const registry = await fetchRegistry();

    // 顯示 Components
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

    // 顯示 Hooks
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

    // 顯示 Utils
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

    const totalItems =
      registry.components.length +
      registry.hooks.length +
      registry.utils.length;
    console.log(
      chalk.gray(
        `Total: ${totalItems} items available (${registry.components.length} components, ${registry.hooks.length} hooks, ${registry.utils.length} utils)`
      )
    );
    console.log(chalk.gray("Usage: npx verza-ui add <item-name>"));
  } catch (error) {
    console.error(chalk.red("Failed to list items"));
  }
}
