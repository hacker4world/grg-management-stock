"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractToken = extractToken;
exports.authenticate = authenticate;
const jwt_util_1 = require("../utilities/jwt.util");
const fetch_util_1 = require("../utilities/fetch.util");
function extractToken(req) {
    // Prefer Authorization header over cookies (better for API testing)
    if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
    }
    // Fallback to cookie for web browsers
    const cookieToken = req.cookies?.token;
    return cookieToken || null;
}
async function authenticate(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        res.status(401).json({ message: "Authentification requise" });
        return;
    }
    const result = (0, jwt_util_1.verifyToken)(token);
    if (result.success === false) {
        const errorMessages = {
            expired: "Token expiré",
            malformed: "Token malformé ou invalide",
            invalid: "Token invalide",
        };
        res.status(401).json({ message: errorMessages[result.error] });
        return;
    }
    const compte = await (0, fetch_util_1.fetchCompte)(result.payload.user_id);
    if (!compte) {
        res.status(401).json({ message: "Utilisateur introuvable" });
        return;
    }
    req.user = compte;
    next();
}
//# sourceMappingURL=auth.middleware.js.map