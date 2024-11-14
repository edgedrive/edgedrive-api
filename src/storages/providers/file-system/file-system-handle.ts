import { EdgeDriveFileSystemHandle } from "../../types/file-system-handle";
import path from "path";

export abstract class FileSystemHandle extends EdgeDriveFileSystemHandle {
  abstract kind: "file" | "directory";
  readonly filePath: string;

  constructor(options: { path: string }) {
    super();
    this.filePath = options.path;
  }

  get name(): string {
    return path.basename(this.filePath);
  }
}
