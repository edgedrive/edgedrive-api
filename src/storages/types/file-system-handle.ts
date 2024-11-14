// inspired by Web API FileSystemHandle
// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle
export abstract class EdgeDriveFileSystemHandle {
  abstract kind: "file" | "directory";
  abstract name: string;

  isSameEntry(fileSystemHandle: EdgeDriveFileSystemHandle) {
    return (
      this.kind === fileSystemHandle.kind && this.name === fileSystemHandle.name
    );
  }

  // TODO: queryPermission, remove, requestPermission
  // queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
  // requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}
