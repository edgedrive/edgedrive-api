import { S3Config } from "./config";
import { S3File } from "./file";
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";

const exampleS3Config: S3Config = {
  endpoint: "https://example.com",
  accessKeyID: "test",
  secretAccessKey: "test",
  bucket: "bucket",
};

describe("S3File", () => {
  beforeAll(() => {
    // Reset fetch mocks before each test
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a file", async () => {
    const file = new S3File({
      objectKey: "folder/test",
      config: exampleS3Config,
    });
    expect(file).toBeDefined();
    expect(file.objectKey).toBe("folder/test");
    expect(file.name()).toBe("test");
  });

  it("should get metadata", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("Hello", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Content-Length": "5",
          "Last-Modified": "Fri, 15 Nov 2024 12:00:00 GMT",
        },
      })
    );

    const file = new S3File({
      objectKey: "folder/test",
      config: exampleS3Config,
    });

    const metadata = await file.getMetadata();
    expect(metadata).toEqual({
      size: 5,
      type: "text/plain",
      lastModified: 1731672000000,
    });

    // should return cached metadata
    const metadata2 = await file.getMetadata();
    expect(metadata2).toEqual({
      size: 5,
      type: "text/plain",
      lastModified: 1731672000000,
    });
  });

  it("should stream", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("Hello", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Content-Length": "5",
          "Last-Modified": "Fri, 15 Nov 2024 12:00:00 GMT",
        },
      })
    );

    const file = new S3File({
      objectKey: "folder/test",
      config: exampleS3Config,
    });

    const stream = await file.stream();
    expect(stream).toBeDefined();

    const text = await new Response(stream).text();
    expect(text).toBe("Hello");
  });

  it("should slice", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("ell", {
        status: 206,
        headers: {
          "Content-Type": "text/plain",
          "Content-Length": "3",
          "Content-Range": "bytes 1-3/5",
        },
      })
    );

    const file = new S3File({
      objectKey: "folder/test",
      config: exampleS3Config,
      start: 1,
      end: 3,
    });

    const text = await new Response(await file.stream()).text();
    expect(text).toBe("ell");
  });

  it("should slice twice", async () => {
    const file = new S3File({
      objectKey: "folder/test",
      config: exampleS3Config,
      start: 1,
      end: 100,
    });

    const slicedFile = file.slice(10, 100);
    expect(slicedFile.start).toBe(11);
    expect(slicedFile.end).toBe(100);
  });

  it("should throw when end is negative", () => {
    const file = new S3File({
      objectKey: "folder/test",
      config: exampleS3Config,
    });

    expect(() => file.slice(0, -1)).toThrow(
      "Not implemented: end cannot be negative",
    );
  });

  it("should get size correctly sliced and not sliced", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("Hello", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Content-Length": "5",
          "Last-Modified": "Fri, 15 Nov 2024 12:00:00 GMT",
        },
      })
    );

    const file = new S3File({
      objectKey: "folder/test",
      config: exampleS3Config,
    });

    const size = await file.size();
    expect(size).toBe(5);

    const slicedFile = file.slice(1, 3);
    const size2 = await slicedFile.size();
    expect(size2).toBe(2);
  });
});
