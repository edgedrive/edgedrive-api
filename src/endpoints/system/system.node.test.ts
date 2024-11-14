import { describe, it, expect } from "vitest";
import app from "./index";

const env = {
  RUNTIME: "node",
};

describe("system", () => {
  it("should return the system information", async () => {
    const res = await app.request("/info", {}, env);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      version: expect.any(String),
      runtime: "node",
    });
  });
});
