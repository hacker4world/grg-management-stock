"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyExpiredToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;
const generateToken = (payload) => {
    return (0, jsonwebtoken_1.sign)(payload, SECRET_KEY, { expiresIn: 36000 });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const payload = (0, jsonwebtoken_1.verify)(token, SECRET_KEY);
        return { success: true, payload };
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.TokenExpiredError) {
            return { success: false, error: "expired" };
        }
        if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
            return { success: false, error: "malformed" };
        }
        return { success: false, error: "invalid" };
    }
};
exports.verifyToken = verifyToken;
const MAX_REFRESH_WINDOW = 7 * 24 * 3600; // 7 days
const verifyExpiredToken = (token) => {
    try {
        const payload = (0, jsonwebtoken_1.verify)(token, SECRET_KEY, { ignoreExpiration: true });
        const now = Math.floor(Date.now() / 1000);
        if (now - payload.exp > MAX_REFRESH_WINDOW) {
            return { success: false, error: "expired" };
        }
        return { success: true, payload: { user_id: payload.user_id } };
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
            return { success: false, error: "malformed" };
        }
        return { success: false, error: "invalid" };
    }
};
exports.verifyExpiredToken = verifyExpiredToken;
//# sourceMappingURL=jwt.util.js.map