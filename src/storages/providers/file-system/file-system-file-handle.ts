import { FileSystemFile } from "./file";
import {
  EdgeDriveFileSystemWritableFileStream,
  FileSystemWriteChunkType,
} from "../../types/file-system-file-handle";
import { NotFoundError } from "../../types/errors";
import { existsSync } from "fs";
import { FileSystemHandle } from "./file-system-handle";

export class FileSystemFileHandle extends FileSystemHandle {
  readonly kind = "file" as const;

  async getFile(): Promise<FileSystemFile> {
    // check if file exists
    const exists = existsSync(this.filePath);

    if (!exists) {
      throw new NotFoundError(this.filePath);
    }

    return new FileSystemFile({
      path: this.filePath,
    });
  }

  async createWritable(options?: {
    keepExistingData?: boolean;
    mode?: "exclusive" | "siloed";
  }): Promise<EdgeDriveFileSystemWritableFileStream> {
    return new FileSystemWritableFileStream({
      path: this.filePath,
      keepExistingData: options?.keepExistingData,
    });
  }
}

class FileSystemWritableFileStream
  implements EdgeDriveFileSystemWritableFileStream
{
  readonly path: string;
  readonly keepExistingData: boolean;

  constructor(options: { path: string; keepExistingData?: boolean }) {
    this.path = options.path;
    this.keepExistingData = options.keepExistingData ?? false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async write(data: FileSystemWriteChunkType): Promise<void> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async seek(position: number): Promise<void> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async truncate(size: number): Promise<void> {
    // TODO: implement
    throw new Error("Not implemented");
  }
}
