export { FileSystemDirectoryHandle } from "./file-system-directory-handle";
export { FileSystemFileHandle } from "./file-system-file-handle";
export { FileSystemHandle } from "./file-system-handle";
export { FileSystemFile as File } from "./file";

export const providerName = "nodejs-file-system";
export const supportedRuntime = ["nodejs"] as const;
