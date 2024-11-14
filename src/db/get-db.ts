import { drizzle as drizzleD1, DrizzleD1Database } from "drizzle-orm/d1";

export async function getDB(env: Env): Promise<DrizzleD1Database> {
  if (env.RUNTIME === "cloudflare-workers") {
    return drizzleD1(env.DATABASE);
  }

  throw new Error("Unsupported runtime");
}
