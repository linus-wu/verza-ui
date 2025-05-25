const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    platform: "node",
    target: "node16",
    outfile: "dist/index.js",
    tsconfig: "tsconfig.json",
  })
  .then(() => {
    console.log("✅ Build completed successfully!");
  })
  .catch((error) => {
    console.error("❌ Build failed:", error);
    process.exit(1);
  });
