import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FileSystemDirectoryHandle } from "./file-system-directory-handle";
import { NotFoundError, TypeMismatchError } from "../../types/errors";
import { mkdtemp, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync } from "fs";

describe("FileSystemDirectoryHandle", () => {
  let tempDir: string;
  let dirHandle: FileSystemDirectoryHandle;

  beforeEach(async () => {
    // Create a temporary directory for our test files
    tempDir = await mkdtemp(join(tmpdir(), 'file-system-dir-test-'));
    dirHandle = new FileSystemDirectoryHandle({ path: tempDir });
  });

  afterEach(async () => {
    // Clean up the temporary directory after tests
    await dirHandle.removeEntry("", { recursive: true });
  });

  describe("getDirectoryHandle", () => {
    it("should create a new directory when create option is true", async () => {
      const newDirHandle = await dirHandle.getDirectoryHandle("newdir", { create: true });
      expect(newDirHandle).toBeDefined();
      expect(newDirHandle?.kind).toBe("directory");
      expect(existsSync(join(tempDir, "newdir"))).toBe(true);
    });

    it("should throw NotFoundError when directory doesn't exist and create is false", async () => {
      await expect(dirHandle.getDirectoryHandle("nonexistent")).rejects.toThrow(NotFoundError);
    });

    it("should throw TypeMismatchError when path exists but is not a directory", async () => {
      await writeFile(join(tempDir, "file.txt"), "content");
      await expect(dirHandle.getDirectoryHandle("file.txt")).rejects.toThrow(TypeMismatchError);
    });
  });

  describe("getFileHandle", () => {
    it("should return handle for existing file", async () => {
      await writeFile(join(tempDir, "test.txt"), "content");
      const fileHandle = await dirHandle.getFileHandle("test.txt");
      expect(fileHandle).toBeDefined();
      expect(fileHandle.kind).toBe("file");
    });

    it("should throw NotFoundError when file doesn't exist and create is false", async () => {
      await expect(dirHandle.getFileHandle("nonexistent.txt")).rejects.toThrow(NotFoundError);
    });

    it("should throw TypeMismatchError when path exists but is not a file", async () => {
      await mkdir(join(tempDir, "dir"));
      await expect(dirHandle.getFileHandle("dir")).rejects.toThrow(TypeMismatchError);
    });
  });

  describe("removeEntry", () => {
    it("should remove a file", async () => {
      await writeFile(join(tempDir, "to-remove.txt"), "content");
      await dirHandle.removeEntry("to-remove.txt");
      expect(existsSync(join(tempDir, "to-remove.txt"))).toBe(false);
    });

    it("should remove a directory recursively", async () => {
      await mkdir(join(tempDir, "dir-to-remove"));
      await writeFile(join(tempDir, "dir-to-remove", "file.txt"), "content");
      await dirHandle.removeEntry("dir-to-remove", { recursive: true });
      expect(existsSync(join(tempDir, "dir-to-remove"))).toBe(false);
    });

    it("should throw NotFoundError when path doesn't exist", async () => {
      await expect(dirHandle.removeEntry("nonexistent")).rejects.toThrow(NotFoundError);
    });
  });

  describe("resolve", () => {
    it("should resolve path for descendant", async () => {
      const subDir = await dirHandle.getDirectoryHandle("subdir", { create: true });
      expect(subDir).toBeDefined();
      if (!subDir) {
        throw new Error("subDir is undefined");
      }
      const resolved = await dirHandle.resolve(subDir);
      expect(resolved).toEqual(["subdir"]);
    });

    it("should return null for non-descendant", async () => {
      const otherDir = new FileSystemDirectoryHandle({ path: "/other/path" });
      const resolved = await dirHandle.resolve(otherDir);
      expect(resolved).toBeNull();
    });
  });

  describe("entries/keys/values", () => {
    let dirHandle: FileSystemDirectoryHandle;
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'file-system-dir-test-'));
      dirHandle = new FileSystemDirectoryHandle({ path: tempDir });

      await writeFile(join(tempDir, "file1.txt"), "content");
      await writeFile(join(tempDir, "file2.txt"), "content");
      await mkdir(join(tempDir, "dir1"));
    });

    it("should iterate over entries", async () => {
      const entries = [];
      for await (const entry of dirHandle.entries()) {
        entries.push(entry);
      }
      expect(entries).toHaveLength(3);
      expect(entries.map(([name]) => name)).toContain("file1.txt");
      expect(entries.map(([name]) => name)).toContain("file2.txt");
      expect(entries.map(([name]) => name)).toContain("dir1");
    });

    it("should iterate over keys", async () => {
      const keys = [];
      for await (const key of dirHandle.keys()) {
        keys.push(key);
      }
      expect(keys).toHaveLength(3);
      expect(keys).toContain("file1.txt");
      expect(keys).toContain("file2.txt");
      expect(keys).toContain("dir1");
    });

    it("should iterate over values", async () => {
      const values = [];
      for await (const value of dirHandle.values()) {
        values.push(value);
      }
      expect(values).toHaveLength(3);
      expect(values.filter(v => v.kind === "file")).toHaveLength(2);
      expect(values.filter(v => v.kind === "directory")).toHaveLength(1);
    });
  });
});
