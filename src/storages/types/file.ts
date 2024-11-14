// inspired by Web API File with some differences
// https://developer.mozilla.org/en-US/docs/Web/API/File
export interface EdgeDriveFile {
  name: () => string;
  lastModified: () => Promise<number> | number;
  size: () => Promise<number> | number;
  type: () => Promise<string> | string;
  slice: (start: number, end: number) => EdgeDriveFile;
  arrayBuffer: () => Promise<ArrayBuffer> | ArrayBuffer;
  stream: () => Promise<ReadableStream> | ReadableStream;
  text: () => Promise<string> | string;
  blob: () => Promise<Blob> | Blob;
}
