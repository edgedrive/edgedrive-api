import { EdgeDriveFile } from "../../types/file";
import { createReadStream, statSync } from "fs";
import { lookup } from "mime-types";
import { ReadableStream as NodeWebReadableStream } from "stream/web";
import path from "path";

export class FileSystemFile extends EdgeDriveFile {
  private readonly filePath: string;
  private readonly fileStart: number | undefined;
  private readonly fileEnd: number | undefined;

  constructor(options: { path: string; start?: number; end?: number }) {
    super();
    this.filePath = options.path;
    this.fileStart = options.start;
    this.fileEnd = options.end;
  }

  name(): string {
    return path.basename(this.filePath);
  }

  lastModified(): number {
    const stats = statSync(this.filePath);
    return stats.mtimeMs;
  }

  size(): number {
    const stats = statSync(this.filePath);
    const totalSize = stats.size;

    if (this.fileStart === undefined) {
      if (this.fileEnd === undefined) {
        return totalSize;
      } else {
        return Math.min(this.fileEnd, totalSize);
      }
    } else if (this.fileEnd === undefined) {
      return totalSize - this.fileStart;
    } else {
      return this.fileEnd - this.fileStart;
    }
  }

  type(): string {
    return lookup(this.filePath) || "application/octet-stream";
  }

  slice(start: number, end: number): FileSystemFile {
    if (end < 0) {
      throw new Error("Not implemented: end cannot be negative");
    }

    const currentSize = this.size();
    const absoluteStart =
      this.fileStart !== undefined ? this.fileStart + start : start;
    const absoluteEnd = Math.min(
      this.fileStart !== undefined ? this.fileStart + end : end,
      this.fileEnd ?? Infinity,
    );

    if (absoluteStart >= currentSize) {
      return new FileSystemFile({
        path: this.filePath,
        start: currentSize,
        end: currentSize,
      });
    }

    return new FileSystemFile({
      path: this.filePath,
      start: absoluteStart,
      end: absoluteEnd,
    });
  }

  stream(): ReadableStream {
    const nodeStream = createReadStream(this.filePath, {
      start: this.fileStart,
      end: this.fileEnd === undefined ? undefined : this.fileEnd - 1,
    });

    return NodeWebReadableStream.from(nodeStream) as ReadableStream;
  }
}
