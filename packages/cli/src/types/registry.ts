export type ModuleInfo = {
  name: string;
  category: "components" | "hooks" | "utils";
  description?: string;
  version: string;
  files: string[];
  dependencies: {
    external: string[];
    internal: string[];
  };
};

export type RegistryResponse = {
  version: string;
  lastUpdated: string;
  components: ModuleInfo[];
  hooks: ModuleInfo[];
  utils: ModuleInfo[];
};
