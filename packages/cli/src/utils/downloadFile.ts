import axios from "axios";
import path from "path";
import fs from "fs-extra";

export const downloadFile = async (url: string, outputPath: string) => {
  try {
    console.log(`Downloading file from: ${url}`);

    const response = await axios.get(url, { responseType: "arraybuffer" });

    await fs.ensureDir(path.dirname(outputPath));
    fs.writeFileSync(outputPath, response.data);

    console.log(`Download completed: ${outputPath}`);
  } catch (error) {
    throw new Error(`Download failed: ${error}`);
  }
};
