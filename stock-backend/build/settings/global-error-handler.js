"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = globalErrorHandler;
function globalErrorHandler(err, request, response, next) {
    if (err && err.type == "body") {
        return response.status(422).json({
            message: "Veuillez verifier les données",
        });
    }
    else {
        console.error("🔴 Global error:", err?.message || err);
        if (err?.stack)
            console.error(err.stack);
        return response.status(500).json({
            message: "Un erreur est survenu",
        });
    }
}
//# sourceMappingURL=global-error-handler.js.map