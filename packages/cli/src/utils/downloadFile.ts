import axios from "axios";
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";

export const downloadFile = async (
  url: string,
  outputPath: string,
  retries: number = 3
): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 15000, // 15 seconds timeout for better reliability
        headers: {
          "User-Agent": "verza-ui-cli",
        },
      });

      // Ensure the directory exists
      await fs.ensureDir(path.dirname(outputPath));

      // Write the file
      await fs.writeFile(outputPath, response.data);

      // Verify the file was written successfully
      const stats = await fs.stat(outputPath);
      if (stats.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      // Success message
      console.log(chalk.green(`✅ Downloaded: ${path.basename(outputPath)}`));
      return; // Success, exit function
    } catch (error) {
      // Check if this is a non-retryable error
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`File not found: ${url}`);
        }
        if (error.response?.status === 403) {
          throw new Error(`Access denied: ${url}`);
        }
      }

      if (attempt === retries) {
        // Last attempt failed
        if (axios.isAxiosError(error)) {
          if (error.code === "ECONNABORTED") {
            throw new Error(`Download timeout: ${url}`);
          } else if (error.code === "ENOTFOUND") {
            throw new Error(`Network error - DNS resolution failed: ${url}`);
          } else if (error.code === "ECONNREFUSED") {
            throw new Error(`Connection refused: ${url}`);
          } else {
            throw new Error(`Network error: ${error.message}`);
          }
        }
        throw new Error(`Download failed after ${retries} attempts: ${error}`);
      } else {
        console.log(
          chalk.yellow(
            `⚠️ Attempt ${attempt} failed, retrying... (${
              retries - attempt
            } attempts left)`
          )
        );
        if (axios.isAxiosError(error) && error.response) {
          console.log(
            chalk.gray(
              `   Status: ${error.response.status} ${error.response.statusText}`
            )
          );
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
};
