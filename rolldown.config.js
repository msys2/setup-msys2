import { defineConfig } from "rolldown";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sbom from "rollup-plugin-sbom";

const root = dirname(fileURLToPath(import.meta.url));

/**
 * @param {string[]} files
 * @returns {import('rolldown').Plugin}
 */
function copyAssets(files) {
  return {
    name: "copy-assets",
    generateBundle() {
      for (const file of files) {
        this.emitFile({
          type: "asset",
          fileName: file,
          source: readFileSync(join(root, file)),
        });
      }
      this.emitFile({
        type: "asset",
        fileName: "package.json",
        source: JSON.stringify({ type: "module" }),
      });
    },
  };
}

export default defineConfig({
  input: {
    index: "main.js"
  },
  output: {
    dir: "dist",
    format: "esm",
    minify: true,
    cleanDir: true,
  },
  platform: "node",
  plugins: [
    sbom({
      includeWellKnown: false,
      outDir: "",
      outFilename: "index.js.cdx",
      saveTimestamp: false,
    }),
    copyAssets(["action.yml", "README.md"]),
  ],
});
