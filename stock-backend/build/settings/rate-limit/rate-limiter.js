"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalRateLimiter = void 0;
require("dotenv/config");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const handler_1 = require("./handler");
exports.globalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW),
    max: Number(process.env.RATE_LIMIT_MAX),
    keyGenerator: () => "global-rate",
    handler: handler_1.rateLimitHandler,
});
//# sourceMappingURL=rate-limiter.js.map