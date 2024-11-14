import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { version } from "../../package.json";

const app = new OpenAPIHono();

app.get("/ping", (c) => c.text("pong"));

// The OpenAPI documentation will be available at /openapi.json
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: version,
    title: "EdgeDrive API",
    description: "The API for the EdgeDrive",
    contact: {
      name: "EdgeDrive",
      url: "https://edgedrive.app",
      email: "api@edgedrive.app",
    },
  },
  servers: [
    {
      url: "/",
      description: "This Origin",
    },
    {
      url: "https://api.edgedrive.app",
      description: "The Production API",
    },
  ],
});

app.get(
  "/docs",
  swaggerUI({ url: "/openapi.json", persistAuthorization: true })
);

// Export the Hono app
export default app;
