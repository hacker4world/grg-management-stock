import "dotenv/config";
import rateLimit from "express-rate-limit";
import { rateLimitHandler } from "./handler";

export const globalRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW),
  max: Number(process.env.RATE_LIMIT_MAX),
  keyGenerator: () => "global-rate",
  handler: rateLimitHandler,
});
