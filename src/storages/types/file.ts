// inspired by Web API File with some differences
// https://developer.mozilla.org/en-US/docs/Web/API/File
export abstract class EdgeDriveFile {
  abstract name(): string;
  abstract lastModified(): Promise<number> | number;
  abstract size(): Promise<number> | number;
  abstract type(): Promise<string> | string;
  abstract slice(start: number, end: number): EdgeDriveFile;
  abstract stream(): Promise<ReadableStream> | ReadableStream;

  async bytes(): Promise<Uint8Array> {
    const stream = await this.stream();
    const response = new Response(stream);
    const bytes = await response.arrayBuffer();
    return new Uint8Array(bytes);
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const stream = await this.stream();
    const response = new Response(stream);
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  }

  async text(): Promise<string> {
    const stream = await this.stream();
    const response = new Response(stream);
    const text = await response.text();
    return text;
  }

  async blob(): Promise<Blob> {
    const stream = await this.stream();
    const type = await this.type();
    const response = new Response(stream, {
      headers: {
        "Content-Type": type,
      },
    });
    const blob = await response.blob();
    return blob;
  }
}
