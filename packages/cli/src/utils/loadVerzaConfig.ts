import path from "path";
import fs from "fs-extra";
import { VerzaConfig } from "../types";
import { CONFIG_FILE_NAME } from "../constants";

export const loadVerzaConfig = () => {
  try {
    const filePath = path.join(process.cwd(), CONFIG_FILE_NAME);
    if (!fs.existsSync(filePath)) {
      console.error(
        "The configuration file does not exist. Please run `init` to initialize the project."
      );
      process.exit(1);
    }
    const configData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(configData) as VerzaConfig;
  } catch (error) {
    console.error("Failed to read the configuration file: ", error);
    process.exit(1);
  }
};
