import express from "express";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { config } from "./config.js";

import {
  middlewareErrorHandler,
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./api/middleware.js";

import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";

import { handlerUsersCreate, handlerUsersUpdate } from "./api/users.js";

import { handlerLogin } from "./api/login.js";
import { handlerRefresh } from "./api/refresh.js";
import { handlerRevoke } from "./api/revoke.js";

import {
  handlerChirpsCreate,
  handlerChirpsDelete,
  handlerChirpsGet,
  handlerChirpsGetOne,
} from "./api/chirps.js";

const PORT = 8080;

// Database migrations
const migrationClient = postgres(config.db.url, { max: 1 });

await migrate(drizzle(migrationClient), config.db.migrationConfig);

// Express app
const app = express();

// Global middleware
app.use(middlewareLogResponses);
app.use(express.json());

// Static files
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

// Health
app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});

// Admin
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});

app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});

// Users
app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerUsersCreate(req, res)).catch(next);
});

app.put("/api/users", (req, res, next) => {
  Promise.resolve(handlerUsersUpdate(req, res)).catch(next);
});

// Authentication
app.post("/api/login", (req, res, next) => {
  Promise.resolve(handlerLogin(req, res)).catch(next);
});

app.post("/api/refresh", (req, res, next) => {
  Promise.resolve(handlerRefresh(req, res)).catch(next);
});

app.post("/api/revoke", (req, res, next) => {
  Promise.resolve(handlerRevoke(req, res)).catch(next);
});

// Chirps
app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerChirpsCreate(req, res)).catch(next);
});

app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerChirpsGet(req, res)).catch(next);
});

app.get("/api/chirps/:chirpId", (req, res, next) => {
  Promise.resolve(handlerChirpsGetOne(req, res)).catch(next);
});

app.delete("/api/chirps/:chirpId", (req, res, next) => {
  Promise.resolve(handlerChirpsDelete(req, res)).catch(next);
});

// Error middleware must stay after all routes
app.use(middlewareErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
