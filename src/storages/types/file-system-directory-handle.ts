import { EdgeDriveFileSystemHandle } from "./file-system-handle";
import { EdgeDriveFileSystemFileHandle } from "./file-system-file-handle";

// inspired by Web API FileSystemDirectoryHandle
// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle
export abstract class EdgeDriveFileSystemDirectoryHandle extends EdgeDriveFileSystemHandle {
  abstract getDirectoryHandle(name: string, options?: {
    create?: boolean;
  }): Promise<EdgeDriveFileSystemDirectoryHandle | undefined>;
  abstract getFileHandle(name: string, options?: {
    create?: boolean;
  }): Promise<EdgeDriveFileSystemFileHandle>;

  abstract removeEntry(name: string, options?: {
    recursive?: boolean;
  }): Promise<void>;

  abstract resolve(possibleDescendant: EdgeDriveFileSystemHandle): Promise<string[] | null>;

  abstract entries(): AsyncIterable<[string, EdgeDriveFileSystemFileHandle | EdgeDriveFileSystemDirectoryHandle]>;
  abstract keys(): AsyncIterable<string>;
  abstract values(): AsyncIterable<EdgeDriveFileSystemFileHandle | EdgeDriveFileSystemDirectoryHandle>;
}
