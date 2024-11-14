import { EdgeDriveFileSystemHandle } from "./file-system-handle";
import type { EdgeDriveFile } from "./file";

// // TODO: EdgeDriveFileSystemSyncAccessHandle
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// type EdgeDriveFileSystemSyncAccessHandle = any;

// inspired by Web API FileSystemFileHandle
// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle
export abstract class EdgeDriveFileSystemFileHandle extends EdgeDriveFileSystemHandle {

  // abstract createSyncAccessHandle(options?: {
  //   mode?: "read-only" | "readwrite" | "readwrite-unsafe"
  // }): Promise<EdgeDriveFileSystemSyncAccessHandle>;

  abstract createWritable(options?: {
    keepExistingData?: boolean;
    mode?: "exclusive" | "siloed"
  }): Promise<EdgeDriveFileSystemWritableFileStream>;

  abstract getFile(): Promise<EdgeDriveFile>;
}


export abstract class EdgeDriveFileSystemWritableFileStream {
  abstract write(data: FileSystemWriteChunkType): Promise<void>;
  abstract seek(position: number): Promise<void>;
  abstract truncate(size: number): Promise<void>;
}

export type FileSystemWriteChunkType = BufferSource | Blob | string | WriteParams;

export type WriteParams =
    | { type: 'write'; position?: number | undefined; data: BufferSource | Blob | string }
    | { type: 'seek'; position: number }
    | { type: 'truncate'; size: number };