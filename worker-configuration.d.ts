// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CloudflareWorkersEnv {
  RUNTIME: "cloudflare-workers";
  DATABASE: D1Database;
}

type Env = CloudflareWorkersEnv;

declare module "cloudflare:test" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ProvidedEnv extends Env {}
}
