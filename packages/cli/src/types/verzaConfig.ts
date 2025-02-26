export type VerzaConfig = {
  useTypeScript: boolean;
  paths: {
    components: string;
    utils: string;
  };
  themeColors: {
    primary: [number, number, number];
    secondary: [number, number, number];
    accent: [number, number, number];
    warning: [number, number, number];
    error: [number, number, number];
  };
};
