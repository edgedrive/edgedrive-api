import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { version } from "../../../package.json";

const app = new OpenAPIHono<{
  Bindings: Env;
}>();

app.openapi(
  createRoute({
    method: "get",
    path: "/info",
    summary: "Get system information",
    responses: {
      200: {
        description: "System information",
        content: {
          "application/json": {
            schema: z.object({
              version: z
                .string()
                .describe("The version of the system")
                .openapi({
                  example: version,
                }),
              runtime: z
                .enum(["cloudflare-workers"])
                .describe("The runtime of the system"),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    return c.json({
      version,
      runtime: c.env.RUNTIME,
    });
  },
);

export default app;
