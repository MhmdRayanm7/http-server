/// <reference types="node" />

import process from "node:process";
import { defineConfig } from "drizzle-kit";

process.loadEnvFile();

const dbUrl = process.env.DB_URL;

if (!dbUrl) {
  throw new Error("Environment variable DB_URL is missing");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});