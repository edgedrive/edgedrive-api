import type { S3Config } from "./config";
import { AwsClient } from "aws4fetch";
import type { EdgeDriveFile } from "../../types/file";

export class S3File implements EdgeDriveFile {
  readonly objectKey: string;
  readonly start: number | undefined = undefined;
  readonly end: number | undefined = undefined;
  metadata: S3FileMetadata | undefined = undefined;

  private readonly config: S3Config;

  constructor(options: {
    objectKey: string;
    config: S3Config;
    start?: number;
    end?: number;
    metadata?: S3FileMetadata;
  }) {
    this.objectKey = options.objectKey;
    this.config = options.config;
    this.start = options?.start;
    this.end = options?.end;
    this.metadata = options?.metadata;
  }

  async getMetadata(): Promise<S3FileMetadata> {
    if (this.metadata) {
      return this.metadata;
    }

    const metadata = await getMetadata(this.objectKey, this.config);
    this.metadata = metadata;
    return metadata;
  }

  async size(): Promise<number> {
    const metadata = await this.getMetadata();

    if (this.start === undefined) {
      if (this.end === undefined) {
        return metadata.size;
      } else {
        return metadata.size - this.end;
      }
    } else if (this.end === undefined) {
      return metadata.size - this.start;
    } else {
      return this.end - this.start;
    }
  }

  async lastModified(): Promise<number> {
    const metadata = await this.getMetadata();
    return metadata.lastModified;
  }

  async type(): Promise<string> {
    const metadata = await this.getMetadata();
    return metadata.type;
  }

  name(): string {
    return this.objectKey.split("/").pop() ?? "";
  }

  // FIXME: handle when end is negative
  slice(start: number, end: number): S3File {
    if (end < 0) {
      throw new Error("Not implemented: end cannot be negative");
    }

    const newStart = this.start !== undefined ? this.start + start : start;
    let newEnd = this.start !== undefined ? this.start + end : end;
    newEnd = Math.min(newEnd, this.end ?? Infinity);

    return new S3File({
      objectKey: this.objectKey,
      config: this.config,
      start: newStart,
      end: newEnd,
      metadata: this.metadata,
    });
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const stream = await this.stream();
    const response = await new Response(stream).arrayBuffer();
    return response;
  }

  async bytes(): Promise<Uint8Array> {
    const arrayBuffer = await this.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  async text(): Promise<string> {
    const bytes = await this.bytes();
    return new TextDecoder().decode(bytes);
  }

  async blob(): Promise<Blob> {
    const buffer = await this.arrayBuffer();
    const type = await this.type();
    return new Blob([buffer], { type });
  }

  async stream(): Promise<ReadableStream> {
    const controller = new AbortController();
    try {
      const client = new AwsClient({
        accessKeyId: this.config.accessKeyID,
        secretAccessKey: this.config.secretAccessKey,
      });

      const url = getObjectURL(this.objectKey, this.config);

      const headers = new Headers();
      if (this.start !== undefined || this.end !== undefined) {
        const rangeStart = this.start ?? 0;
        if (this.end !== undefined) {
          headers.set("Range", `bytes=${rangeStart}-${this.end}`);
        } else {
          headers.set("Range", `bytes=${rangeStart}-`);
        }
      }

      const request = new Request(url.toString(), {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      const signedRequest = await client.sign(request);
      const response = await fetch(signedRequest);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch object content: ${response.statusText}`,
        );
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      return response.body;
    } catch (error) {
      controller.abort();
      throw error;
    }
  }
}

async function getMetadata(
  objectKey: string,
  config: S3Config,
): Promise<{
  size: number;
  type: string;
  lastModified: number;
}> {
  const client = new AwsClient({
    accessKeyId: config.accessKeyID,
    secretAccessKey: config.secretAccessKey,
  });

  const url = getObjectURL(objectKey, config);
  const request = new Request(url.toString(), {
    method: "HEAD",
  });

  const signedRequest = await client.sign(request);
  const response = await fetch(signedRequest);
  const size = parseInt(response.headers.get("Content-Length") ?? "0");
  const type =
    response.headers.get("Content-Type") ?? "application/octet-stream";
  const lastModifiedString = response.headers.get("Last-Modified");
  const lastModified = lastModifiedString
    ? new Date(lastModifiedString).getTime()
    : 0;

  return {
    size,
    type,
    lastModified,
  };
}

export interface S3FileMetadata {
  size: number;
  type: string;
  lastModified: number;
}

export function getObjectURL(objectKey: string, config: S3Config): URL {
  return new URL(`${config.endpoint}/${config.bucket}/${objectKey}`);
}
