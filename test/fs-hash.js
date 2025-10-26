import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { hashPath } from "../src/fs-hash.js";

describe("hashPath", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "hash-test-"));
  });

  afterEach(async () => {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });

  test("same folder checked twice produces same hash", async () => {
    const dir = path.join(tempDir, "folder");
    await fs.promises.mkdir(dir);
    await fs.promises.writeFile(path.join(dir, "file.txt"), "content");

    const hash1 = await hashPath(dir);
    const hash2 = await hashPath(dir);

    assert.equal(hash1, hash2);
  });

  test("same name and content in different parents produces same hash", async () => {
    const dir1 = path.join(tempDir, "parent1", "folder");
    await fs.promises.mkdir(dir1, { recursive: true });
    await fs.promises.writeFile(path.join(dir1, "file.txt"), "content");

    const dir2 = path.join(tempDir, "parent2", "folder");
    await fs.promises.mkdir(dir2, { recursive: true });
    await fs.promises.writeFile(path.join(dir2, "file.txt"), "content");

    const hash1 = await hashPath(dir1);
    const hash2 = await hashPath(dir2);

    assert.equal(hash1, hash2);
  });

  test("file rename or content change produces different hash", async () => {
    const dir = path.join(tempDir, "folder");
    await fs.promises.mkdir(dir);
    await fs.promises.writeFile(path.join(dir, "file.txt"), "content");

    const hash1 = await hashPath(dir);

    await fs.promises.writeFile(path.join(dir, "file.txt"), "changed");
    const hash2 = await hashPath(dir);
    assert.notEqual(hash1, hash2);

    await fs.promises.writeFile(path.join(dir, "file.txt"), "content");
    await fs.promises.rename(
      path.join(dir, "file.txt"),
      path.join(dir, "renamed.txt")
    );
    const hash3 = await hashPath(dir);
    assert.notEqual(hash1, hash3);
  });

  test("same name but different content produces different hash", async () => {
    const dir = path.join(tempDir, "folder");
    await fs.promises.mkdir(dir);
    await fs.promises.writeFile(path.join(dir, "file.txt"), "content A");

    const hash1 = await hashPath(dir);

    await fs.promises.rm(dir, { recursive: true });
    await fs.promises.mkdir(dir);
    await fs.promises.writeFile(path.join(dir, "file.txt"), "content B");

    const hash2 = await hashPath(dir);

    assert.notEqual(hash1, hash2);
  });

  test("same content but different names produces different hash", async () => {
    const dir1 = path.join(tempDir, "folder1");
    await fs.promises.mkdir(dir1);
    await fs.promises.writeFile(path.join(dir1, "file.txt"), "content");

    const dir2 = path.join(tempDir, "folder2");
    await fs.promises.mkdir(dir2);
    await fs.promises.writeFile(path.join(dir2, "file.txt"), "content");

    const hash1 = await hashPath(dir1);
    const hash2 = await hashPath(dir2);

    assert.notEqual(hash1, hash2);
  });

  test("same file checked twice has same hash", async () => {
    const file = path.join(tempDir, "test.txt");
    await fs.promises.writeFile(file, "content");

    assert.equal(await hashPath(file), await hashPath(file));
  });

  test("same name and content in different folders has same hash", async () => {
    await fs.promises.mkdir(path.join(tempDir, "dir1"));
    await fs.promises.mkdir(path.join(tempDir, "dir2"));
    const file1 = path.join(tempDir, "dir1", "test.txt");
    const file2 = path.join(tempDir, "dir2", "test.txt");
    await fs.promises.writeFile(file1, "content");
    await fs.promises.writeFile(file2, "content");

    assert.equal(await hashPath(file1), await hashPath(file2));
  });

  test("different name has different hash", async () => {
    const file1 = path.join(tempDir, "a.txt");
    const file2 = path.join(tempDir, "b.txt");
    await fs.promises.writeFile(file1, "content");
    await fs.promises.writeFile(file2, "content");

    assert.notEqual(await hashPath(file1), await hashPath(file2));
  });

  test("different content has different hash", async () => {
    const file = path.join(tempDir, "test.txt");
    await fs.promises.writeFile(file, "content1");
    const hash1 = await hashPath(file);

    await fs.promises.writeFile(file, "content2");

    assert.notEqual(hash1, await hashPath(file));
  });
});
