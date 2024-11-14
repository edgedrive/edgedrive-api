import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FileSystemFile } from "./file";
import { writeFile, mkdtemp, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

describe("FileSystemFile", () => {
  let tempDir: string;

  beforeAll(async () => {
    // Create a temporary directory for our test files
    tempDir = await mkdtemp(join(tmpdir(), 'file-system-test-'));
  });

  afterAll(async () => {
    // Clean up the temporary directory after tests
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should create a file", async() => {
    const filePath = join(tempDir, "test.txt");
    await writeFile(filePath, "Hello");

    const file = new FileSystemFile({
      path: filePath,
    });
    expect(file).toBeDefined();
    expect(file.name()).toBe("test.txt");
  });

  it("should get metadata correctly", async() => {
    const filePath = join(tempDir, "metadata.txt");
    await writeFile(filePath, "Hello");

    const file = new FileSystemFile({
      path: filePath,
    });

    expect(file.size()).toBe(5);
    expect(file.type()).toBe("text/plain");
    expect(file.lastModified()).toBeTypeOf("number");
  });

  it("should stream content", async () => {
    const filePath = join(tempDir, "stream.txt");
    await   writeFile(filePath, "Hello");

    const file = new FileSystemFile({
      path: filePath,
    });

    const stream = file.stream();
    expect(stream).toBeDefined();

    const text = await new Response(stream).text();
    expect(text).toBe("Hello");
  });

  it("should slice correctly", async () => {
    const filePath = join(tempDir, "slice.txt");
    await writeFile(filePath, "Hello World");

    const file = new FileSystemFile({
      path: filePath,
    });

    const slicedFile = file.slice(1, 5);
    expect(slicedFile).toBeInstanceOf(FileSystemFile);
    
    const text = await new Response(slicedFile.stream()).text();
    expect(text).toBe("ello");
  });

  it("should slice twice correctly", async () => {
    const filePath = join(tempDir, "double-slice.txt");
    await writeFile(filePath, "Hello World");

    const file = new FileSystemFile({
      path: filePath,
    });

    const expectedBlob = new Blob(["Hello World"]);

    const slicedOnce = file.slice(1, 9);
    const slicedOnceBlob = expectedBlob.slice(1, 9);
    const textOnce = await new Response(slicedOnce.stream()).text();
    expect(textOnce).toEqual("ello Wor");
    expect(textOnce).toEqual(await slicedOnceBlob.text()); 


    const slicedTwice = slicedOnce.slice(2, 5);
    const slicedTwiceBlob = slicedOnceBlob.slice(2, 5);
    const textTwice = await new Response(slicedTwice.stream()).text();
    expect(textTwice).toEqual("lo ");
    expect(textTwice).toEqual(await slicedTwiceBlob.text());
  });

  it("should throw when end is negative", async () => {
    const filePath = join(tempDir, "negative.txt");
    await writeFile(filePath, "Hello");

    const file = new FileSystemFile({
      path: filePath,
    });

    expect(() => file.slice(0, -1)).toThrow(
      "Not implemented: end cannot be negative"
    );
  });

  it("should get size correctly for sliced and non-sliced files", async () => {
    const filePath = join(tempDir, "sizes.txt");
    await writeFile(filePath, "Hello World");

    const expectedBlob = new Blob(["Hello World"]);

    const file = new FileSystemFile({
      path: filePath,
    });

    expect(file.size()).toBe(expectedBlob.size);

    const slicedFile = file.slice(1, 5);
    const slicedFileBlob = expectedBlob.slice(1, 5);
    expect(slicedFile.size()).toBe(slicedFileBlob.size);
  });

  it("should convert to text", async () => {
    const filePath = join(tempDir, "text.txt");
    await writeFile(filePath, "Hello World");

    const file = new FileSystemFile({
      path: filePath,
    });

    const text = await file.text();
    expect(text).toBe("Hello World");
  });

  it("should convert to blob", async () => {
    const filePath = join(tempDir, "blob.txt");
    await writeFile(filePath, "Hello World");

    const file = new FileSystemFile({
      path: filePath,
    });

    const blob = await file.blob();
    expect(blob.type).toBe("text/plain");
    expect(await blob.text()).toBe("Hello World");
  });
});
