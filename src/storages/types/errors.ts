export class NotAllowedError extends Error {
  readonly name = "NotAllowedError";

  constructor(path: string) {
    super(`Not allowed to access ${path}`);
  }
}

export class NotFoundError extends Error {
  readonly name = "NotFoundError";

  constructor(path: string) {
    super(`Not found ${path}`);
  }
}

export class TypeMismatchError extends Error {
  readonly name = "TypeMismatchError";

  constructor(path: string) {
    super(`Type mismatch ${path}`);
  }
}
