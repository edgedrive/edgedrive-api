import { describe, it, expect } from "vitest";
import app from "./index";

describe("OpenAPI", () => {
  it("should return /openapi.json", async () => {
    const res = await app.request("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    const json = await res.json();
    expect(json).toBeDefined();
  });

  it("should return /docs", async () => {
    const res = await app.request("/docs");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });
});
