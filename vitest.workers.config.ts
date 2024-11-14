import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
      },
    },
    coverage: {
      provider: "istanbul", // or 'v8'
      reporter: ["text", "json-summary", "json", "html", "clover"],
      include: ["src"],
    },
  },
});
