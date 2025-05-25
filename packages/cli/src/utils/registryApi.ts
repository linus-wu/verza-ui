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
  components: ComponentInfo[];
  version: string;
}

export async function fetchComponentsList(): Promise<ComponentInfo[]> {
  console.log(chalk.gray("Fetching components list..."));

  try {
    const response = await axios.get<RegistryResponse>(REGISTRY_JSON_URL, {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    });
    return response.data.components;
  } catch (apiError) {
    console.log(
      chalk.yellow("⚠️ Registry not available from GitHub, using fallback...")
    );
    if (axios.isAxiosError(apiError)) {
      console.log(chalk.gray(`   Reason: ${apiError.message}`));
    }
    return getFallbackComponentsList();
  }
}

export async function fetchComponentInfo(
  componentName: string
): Promise<ComponentInfo | null> {
  try {
    const components = await fetchComponentsList();
    return (
      components.find(
        (comp) => comp.name.toLowerCase() === componentName.toLowerCase()
      ) || null
    );
  } catch (error) {
    console.error(
      chalk.red(`Failed to fetch component info for ${componentName}:`),
      error
    );
    return null;
  }
}

export async function validateComponent(
  componentName: string
): Promise<boolean> {
  const componentInfo = await fetchComponentInfo(componentName);
  return componentInfo !== null && componentInfo.category === "components";
}

function getFallbackComponentsList(): ComponentInfo[] {
  return [
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
  ];
}

export async function listAvailableComponents(): Promise<void> {
  try {
    const allComponents = await fetchComponentsList();

    const components = allComponents.filter(
      (component) => component.category === "components"
    );

    console.log(chalk.cyan("\n📦 Available Components:\n"));

    components.forEach((component) => {
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

    console.log(chalk.gray(`Total: ${components.length} components available`));
    console.log(chalk.gray("Usage: npx verza-ui add <component-name>"));
  } catch (error) {
    console.error(chalk.red("Failed to list components"));
  }
}
