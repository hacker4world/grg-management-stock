"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({ message: "Authentification requise" });
            return;
        }
        const userRole = authReq.user.role;
        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({ message: "Rôle insuffisant" });
            return;
        }
        next();
    };
}
//# sourceMappingURL=role.middleware.js.map