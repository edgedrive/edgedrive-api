import { env } from "cloudflare:test";
import { getDB } from "./get-db";
import { describe, it, expect } from "vitest";

describe("getDB", () => {
  it("should return a DrizzleD1Database", async () => {
    const db = await getDB(env);
    expect(db).toBeDefined();
  });
});
