import {
  hasTailwindInstalled,
  hasTailwindPrettierSetup,
  getTailwindVersion,
  isTailwindV4OrLater,
} from "./detect";
import { setupTailwindForNextjs } from "./nextjs";
import { setupTailwindPrettier } from "./prettier";
import { setupTailwindCustomStyles } from "./customStyles";

export {
  hasTailwindInstalled,
  hasTailwindPrettierSetup,
  getTailwindVersion,
  isTailwindV4OrLater,
  setupTailwindForNextjs,
  setupTailwindPrettier,
  setupTailwindCustomStyles,
};
