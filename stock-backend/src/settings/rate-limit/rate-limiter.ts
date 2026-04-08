import "dotenv/config";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { rateLimitHandler } from "./handler";

export const globalRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW),
  max: Number(process.env.RATE_LIMIT_MAX),
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: rateLimitHandler,
});
