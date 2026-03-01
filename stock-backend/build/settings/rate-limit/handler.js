"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitHandler = rateLimitHandler;
function rateLimitHandler(request, response) {
    return response.status(429).json({
        message: "Api rate limit exceeded, Try again later",
    });
}
//# sourceMappingURL=handler.js.map