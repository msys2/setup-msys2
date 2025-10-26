import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

/**
 * @param {string} inputPath
 * @returns {Promise<string>}
 */
export async function hashPath(inputPath) {
  const stats = await fs.promises.stat(inputPath);
  
  if (stats.isFile()) {
    return hashFile(inputPath);
  } else if (stats.isDirectory()) {
    return hashDirectory(inputPath);
  } else {
    throw new Error(`Unsupported path type: ${inputPath}`);
  }
}

/**
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function hashFile(filePath) {
  const hash = createHash("sha256");
  const fileName = path.basename(filePath);

  hash.update(fileName);

  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve());
    stream.on("error", reject);
  });
  
  return hash.digest("hex");
}

/**
 * @param {string} dirPath
 * @returns {Promise<string>}
 */
async function hashDirectory(dirPath) {
  const hash = createHash("sha256");
  const dirName = path.basename(dirPath);

  hash.update(dirName);

  const entries = await fs.promises.readdir(dirPath, {
    withFileTypes: true,
  });

  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    hash.update(entry.name);

    if (entry.isDirectory()) {
      const subHash = await hashDirectory(fullPath);
      hash.update(subHash);
    } else if (entry.isFile()) {
      await new Promise((resolve, reject) => {
        const stream = fs.createReadStream(fullPath);
        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve());
        stream.on("error", reject);
      });
    }
  }

  return hash.digest("hex");
}
