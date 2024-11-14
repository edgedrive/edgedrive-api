import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FileSystemFileHandle } from "./file-system-file-handle";
import { writeFile, mkdtemp, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { NotFoundError } from "../../types/errors";

describe("FileSystemFileHandle", () => {
  let tempDir: string;

  beforeAll(async () => {
    // Create a temporary directory for our test files
    tempDir = await mkdtemp(join(tmpdir(), 'file-handle-test-'));
  });

  afterAll(async () => {
    // Clean up the temporary directory after tests
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should create a file handle", () => {
    const filePath = join(tempDir, "test.txt");
    const handle = new FileSystemFileHandle({
      path: filePath,
    });
    expect(handle).toBeDefined();
    expect(handle.kind).toBe("file");
    expect(handle.name).toBe("test.txt");
  });

  it("should get file when it exists", async () => {
    const filePath = join(tempDir, "exists.txt");
    await writeFile(filePath, "Hello");

    const handle = new FileSystemFileHandle({
      path: filePath,
    });

    const file = await handle.getFile();
    expect(file).toBeDefined();
    expect(file.name()).toBe("exists.txt");
    expect(await file.text()).toBe("Hello");
  });

  it("should throw NotFoundError when getting non-existent file", async () => {
    const filePath = join(tempDir, "nonexistent.txt");
    const handle = new FileSystemFileHandle({
      path: filePath,
    });

    await expect(handle.getFile()).rejects.toThrow(NotFoundError);
  });

  it("should create writable stream", async () => {
    const filePath = join(tempDir, "writable.txt");
    const handle = new FileSystemFileHandle({
      path: filePath,
    });

    const writable = await handle.createWritable();
    expect(writable).toBeDefined();
  });

  it("should create writable stream with keepExistingData option", async () => {
    const filePath = join(tempDir, "writable-keep.txt");
    const handle = new FileSystemFileHandle({
      path: filePath,
    });

    const writable = await handle.createWritable({ keepExistingData: true });
    expect(writable).toBeDefined();
  });

  describe("FileSystemWritableFileStream", () => {
    it("should throw not implemented for write", async () => {
      const filePath = join(tempDir, "stream.txt");
      const handle = new FileSystemFileHandle({
        path: filePath,
      });

      const writable = await handle.createWritable();
      await expect(writable.write("test")).rejects.toThrow("Not implemented");
    });

    it("should throw not implemented for seek", async () => {
      const filePath = join(tempDir, "stream.txt");
      const handle = new FileSystemFileHandle({
        path: filePath,
      });

      const writable = await handle.createWritable();
      await expect(writable.seek(0)).rejects.toThrow("Not implemented");
    });

    it("should throw not implemented for truncate", async () => {
      const filePath = join(tempDir, "stream.txt");
      const handle = new FileSystemFileHandle({
        path: filePath,
      });

      const writable = await handle.createWritable();
      await expect(writable.truncate(0)).rejects.toThrow("Not implemented");
    });
  });
});
