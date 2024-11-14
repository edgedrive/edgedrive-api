import { S3Config } from "./config";
import { S3File } from "./file";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { fetchMock } from "cloudflare:test";

const exampleS3Config: S3Config = {
  endpoint: "https://example.com",
  accessKeyID: "test",
  secretAccessKey: "test",
  bucket: "bucket",
};

describe("S3File", () => {
  beforeAll(() => {
    // Enable outbound request mocking...
    fetchMock.activate();
    // ...and throw errors if an outbound request isn't mocked
    fetchMock.disableNetConnect();
  });
  // Ensure we matched every mock we defined
  afterEach(() => fetchMock.assertNoPendingInterceptors());

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
    fetchMock
      .get("https://example.com")
      .intercept({
        path: "/bucket/folder/test",
        method: "HEAD",
      })
      .defaultReplyHeaders({
        "Content-Type": "text/plain",
        "Content-Length": "5",
        "Last-Modified": "Fri, 15 Nov 2024 12:00:00 GMT",
      })
      .reply(200, "Hello");

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
    fetchMock
      .get("https://example.com")
      .intercept({
        path: "/bucket/folder/test",
        method: "GET",
      })
      .defaultReplyHeaders({
        "Content-Type": "text/plain",
        "Content-Length": "5",
        "Last-Modified": "Fri, 15 Nov 2024 12:00:00 GMT",
      })
      .reply(200, "Hello");

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
    fetchMock
      .get("https://example.com")
      .intercept({
        path: "/bucket/folder/test",
        method: "GET",
        headers: {
          Range: "bytes=1-3",
        },
      })
      .reply(206, "ell");

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
    fetchMock
      .get("https://example.com")
      .intercept({
        path: "/bucket/folder/test",
        method: "HEAD",
      })
      .defaultReplyHeaders({
        "Content-Type": "text/plain",
        "Content-Length": "5",
        "Last-Modified": "Fri, 15 Nov 2024 12:00:00 GMT",
      })
      .reply(200, "Hello");

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
