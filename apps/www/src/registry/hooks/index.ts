import { useToggleRegistry } from "./useToggle/useToggle.registry";
import useToggle from "./useToggle/useToggle";

export const hooksRegistry = {
  useToggle: { hook: useToggle, metadata: useToggleRegistry },
};
