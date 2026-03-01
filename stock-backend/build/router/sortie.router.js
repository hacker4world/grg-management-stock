"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortieRouter = void 0;
const express_1 = require("express");
const validator_1 = require("../settings/validators/validator");
const sortie_validator_1 = require("../settings/validators/sortie.validator");
const sortie_service_1 = require("../controller/sortie.service");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
exports.sortieRouter = (0, express_1.Router)();
const service = new sortie_service_1.SortieService();
/**
 * Custom middleware for the dynamic createSortieValidator
 * (it's a function, not a Joi schema, so we can't use requestBodyValidator.body())
 */
function validateCreateSortie(req, res, next) {
    const result = (0, sortie_validator_1.createSortieValidator)(req.body);
    if (result.error) {
        const errorMessage = result.error.details
            ? result.error.details.map((d) => d.message)
            : result.error.message;
        return res.status(400).json({
            message: "Validation error",
            details: errorMessage,
        });
    }
    if (result.value) {
        req.body = result.value;
    }
    next();
}
exports.sortieRouter.post("/create", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.MAGAZINIER), validateCreateSortie, service.createSortie.bind(service));
exports.sortieRouter.get("/list-pending", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.MAGAZINIER), validator_1.requestBodyValidator.query(sortie_validator_1.listSortiesValidator), service.listSorties.bind(service));
exports.sortieRouter.get("/list-confirme", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.MAGAZINIER), validator_1.requestBodyValidator.query(sortie_validator_1.listSortiesValidator), service.listConfirmedSorties.bind(service));
exports.sortieRouter.put("/confirm-deny", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.MAGAZINIER), validator_1.requestBodyValidator.body(sortie_validator_1.confirmDenySortieValidator), service.confirmDenySortie.bind(service));
exports.sortieRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.MAGAZINIER), validator_1.requestBodyValidator.query(sortie_validator_1.deleteSortieValidator), service.deleteSortie.bind(service));
//# sourceMappingURL=sortie.router.js.map