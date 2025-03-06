import { Registry } from "@/types/registry";

export const cnRegistry: Registry = {
  name: "cn",
  category: "utils",
  requiredFiles: ["cn.ts"],
  externalDependencies: ["clsx", "tailwind-merge"],
  internalDependencies: [],
};
