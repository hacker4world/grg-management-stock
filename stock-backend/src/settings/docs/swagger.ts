import { Express } from "express";
import swaggerJSDoc = require("swagger-jsdoc");
import swaggerUI = require("swagger-ui-express")
import "./schemas";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Stock-Project API",
      version: "1.0.0",
      description: "Inventory management (articles, entries, manufacturers …)",
    },
    servers: [{ url: "/api" }], // <-- all routes are prefixed with /api
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // auto-scan every route file for JSDoc comments
  apis: [
    "src/router/*.ts",
    "src/router/classement/*.ts",
    "src/settings/docs/schemas.ts",
  ],
};

const specs = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  app.use(
    "/api/docs",
    swaggerUI.serve,
    swaggerUI.setup(specs, {
      swaggerOptions: { persistAuthorization: true },
    }),
  );
}
