export type Registry = {
  name: string;
  category: "components" | "hooks" | "utils";
  requiredFiles: string[];
  externalDependencies: string[];
  internalDependencies: string[];
};
