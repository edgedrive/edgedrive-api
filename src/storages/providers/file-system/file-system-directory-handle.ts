import { FileSystemHandle } from "./file-system-handle";
import { FileSystemFileHandle } from "./file-system-file-handle";
import { EdgeDriveFileSystemDirectoryHandle } from "../../types/file-system-directory-handle";
import { NotFoundError } from "../../types/errors";
import { existsSync } from "fs";
import { join } from "path";
import { mkdir, readdir, rm, stat } from "fs/promises";
import { TypeMismatchError } from "../../types/errors";

export class FileSystemDirectoryHandle extends FileSystemHandle implements EdgeDriveFileSystemDirectoryHandle {
  readonly kind = "directory" as const;

  async getDirectoryHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FileSystemDirectoryHandle | undefined> {
    const dirPath = join(this.filePath, name);
    const exists = existsSync(dirPath);

    if (!exists) {
      if (options?.create) {
        await mkdir(dirPath, { recursive: true });
      } else {
        throw new NotFoundError(dirPath);
      }
    } else if (!(await stat(dirPath)).isDirectory()) {
      throw new TypeMismatchError(dirPath);
    }

    return new FileSystemDirectoryHandle({ path: dirPath });
  }

  async getFileHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FileSystemFileHandle> {
    const filePath = join(this.filePath, name);
    const exists = existsSync(filePath);

    if (!exists && !options?.create) {
      throw new NotFoundError(filePath);
    }

    if (exists && !(await stat(filePath)).isFile()) {
      throw new TypeMismatchError(filePath);
    }

    return new FileSystemFileHandle({ path: filePath });
  }

  async removeEntry(name: string, options?: { recursive?: boolean }): Promise<void> {
    const path = join(this.filePath, name);
    
    if (!existsSync(path)) {
      throw new NotFoundError(path);
    }

    await rm(path, { recursive: options?.recursive ?? false });
  }

  async resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null> {
    if (!possibleDescendant.filePath.startsWith(this.filePath)) {
      return null;
    }

    const relativePath = possibleDescendant.filePath.slice(this.filePath.length);
    return relativePath.split("/").filter(Boolean);
  }

  async *entries(): AsyncIterable<[string, FileSystemFileHandle | FileSystemDirectoryHandle]> {
    const entries = await readdir(this.filePath, { withFileTypes: true });

    for (const entry of entries) {
      const path = join(this.filePath, entry.name);
      if (entry.isDirectory()) {
        yield [entry.name, new FileSystemDirectoryHandle({ path })];
      } else if (entry.isFile()) {
        yield [entry.name, new FileSystemFileHandle({ path })];
      }
    }
  }

  async *keys(): AsyncIterable<string> {
    const entries = await readdir(this.filePath);
    for (const entry of entries) {
      yield entry;
    }
  }

  async *values(): AsyncIterable<FileSystemFileHandle | FileSystemDirectoryHandle> {
    const entries = await readdir(this.filePath, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(this.filePath, entry.name);
      if (entry.isDirectory()) {
            yield new FileSystemDirectoryHandle({ path });
      } else if (entry.isFile()) {
        yield new FileSystemFileHandle({ path });
      }
    }
  }
}
