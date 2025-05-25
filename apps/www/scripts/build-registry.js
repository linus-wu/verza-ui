const fs = require("fs");
const path = require("path");

// 動態導入 registry
async function buildRegistry() {
  try {
    console.log("🔨 Building registry.json...");

    // 使用 Node.js 的動態導入來載入 TypeScript 模組
    const registryPath = path.join(__dirname, "../src/registry/index.ts");

    // 由於我們需要處理 TypeScript，我們將使用 ts-node 或者編譯後的版本
    // 這裡我們先創建一個簡單的版本，直接讀取文件結構

    const registryData = await generateRegistryFromFiles();

    // 生成最終的 JSON 結構
    const output = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      components: registryData,
    };

    // 寫入 JSON 文件
    const outputPath = path.join(__dirname, "../src/registry/registry.json");
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log("✅ Registry JSON generated successfully!");
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📦 Total components: ${registryData.length}`);
  } catch (error) {
    console.error("❌ Error building registry:", error);
    process.exit(1);
  }
}

async function generateRegistryFromFiles() {
  const registryDir = path.join(__dirname, "../src/registry");
  const components = [];

  // 掃描 components 目錄
  const componentsDir = path.join(registryDir, "components");
  if (fs.existsSync(componentsDir)) {
    const componentFolders = fs
      .readdirSync(componentsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const folder of componentFolders) {
      const registryFile = path.join(
        componentsDir,
        folder,
        `${folder.charAt(0).toUpperCase() + folder.slice(1)}.registry.ts`,
      );
      if (fs.existsSync(registryFile)) {
        const component = await parseRegistryFile(
          registryFile,
          "components",
          folder,
        );
        if (component) components.push(component);
      }
    }
  }

  // 掃描 hooks 目錄
  const hooksDir = path.join(registryDir, "hooks");
  if (fs.existsSync(hooksDir)) {
    const hookFolders = fs
      .readdirSync(hooksDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const folder of hookFolders) {
      const registryFile = path.join(hooksDir, folder, `${folder}.registry.ts`);
      if (fs.existsSync(registryFile)) {
        const hook = await parseRegistryFile(registryFile, "hooks", folder);
        if (hook) components.push(hook);
      }
    }
  }

  // 掃描 utils 目錄
  const utilsDir = path.join(registryDir, "utils");
  if (fs.existsSync(utilsDir)) {
    const utilFolders = fs
      .readdirSync(utilsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const folder of utilFolders) {
      const registryFile = path.join(utilsDir, folder, `${folder}.registry.ts`);
      if (fs.existsSync(registryFile)) {
        const util = await parseRegistryFile(registryFile, "utils", folder);
        if (util) components.push(util);
      }
    }
  }

  return components;
}

async function parseRegistryFile(filePath, category, folderName) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // 簡單的正則表達式解析（更安全的方法）
    const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
    const categoryMatch = content.match(/category:\s*["']([^"']+)["']/);
    const requiredFilesMatch = content.match(/requiredFiles:\s*\[(.*?)\]/s);
    const externalDepsMatch = content.match(
      /externalDependencies:\s*\[(.*?)\]/s,
    );
    const internalDepsMatch = content.match(
      /internalDependencies:\s*\[(.*?)\]/s,
    );

    if (!nameMatch) {
      console.warn(`⚠️ Could not parse name from ${filePath}`);
      return null;
    }

    const name = nameMatch[1];
    const parsedCategory = categoryMatch ? categoryMatch[1] : category;

    // 解析數組
    const parseArray = (match) => {
      if (!match || !match[1].trim()) return [];
      return match[1]
        .split(",")
        .map((item) => item.trim().replace(/["']/g, ""))
        .filter((item) => item.length > 0);
    };

    const requiredFiles = parseArray(requiredFilesMatch);
    const externalDependencies = parseArray(externalDepsMatch);
    const internalDependencies = parseArray(internalDepsMatch);

    // 生成文件路徑
    const files = requiredFiles.map(
      (file) => `${category}/${folderName}/${file}`,
    );

    return {
      name: name,
      category: parsedCategory,
      description: `${name} ${category.slice(0, -1)}`, // 簡單的描述
      version: "1.0.0",
      files: files,
      dependencies: {
        external: externalDependencies,
        internal: internalDependencies,
      },
    };
  } catch (error) {
    console.error(`❌ Error parsing ${filePath}:`, error);
    return null;
  }
}

// 執行腳本
buildRegistry();
