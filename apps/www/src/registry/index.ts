import { componentsRegistry } from "./components";
import { hooksRegistry } from "./hooks";
import { utilsRegistry } from "./utils";

export const registry = {
  ...componentsRegistry,
  ...hooksRegistry,
  ...utilsRegistry,
};
