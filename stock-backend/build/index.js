"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const data_source_1 = require("./data-source");
const fournisseur_router_1 = require("./router/fournisseur.router");
const fabriquant_router_1 = require("./router/fabriquant.router");
const chantier_router_1 = require("./router/chantier.router");
const famille_router_1 = require("./router/classement/famille.router");
const sousFamilles_router_1 = require("./router/classement/sousFamilles.router");
const category_router_1 = require("./router/classement/category.router");
const articles_router_1 = require("./router/articles.router");
const rate_limiter_1 = require("./settings/rate-limit/rate-limiter");
const compte_router_1 = require("./router/compte.router");
const global_error_handler_1 = require("./settings/global-error-handler");
const depot_router_1 = require("./router/depot.router");
const unite_router_1 = require("./router/unite.router");
const demandeArticle_router_1 = require("./router/demandeArticle.router");
const retour_router_1 = require("./router/retour.router");
const swagger_1 = require("./settings/docs/swagger");
const entree_router_1 = require("./router/entree.router");
const sortie_router_1 = require("./router/sortie.router");
const document_router_1 = require("./router/document.router");
const notificationRouter_1 = require("./router/notificationRouter");
const export_router_1 = require("./router/export.router");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
// CORS configuration - Allow mobile app and web frontend
const allowedOrigins = [
    "http://localhost:4200", // Angular web frontend
    "http://localhost:8081", // Expo web
    "http://localhost:19006", // Expo web alt
    "http://10.0.2.2:8081", // Android emulator
];
app.use((0, cors_1.default)({
    credentials: true,
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // In development, allow all origins
        if (process.env.NODE_ENV !== "production") {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(rate_limiter_1.globalRateLimiter);
app.use("/api/fournisseurs", fournisseur_router_1.fournisseurRouter);
app.use("/api/fabriquants", fabriquant_router_1.fabriquantRouter);
app.use("/api/chantier", chantier_router_1.chantierRouter);
app.use("/api/classement/familles", famille_router_1.familleRouter);
app.use("/api/classement/sous-famille", sousFamilles_router_1.sousFamillesRouter);
app.use("/api/classement/categorie", category_router_1.categoryRouter);
app.use("/api/articles", articles_router_1.articlesRouter);
app.use("/api/authentification", compte_router_1.compteRouter);
app.use("/api/depots", depot_router_1.depotRouter);
app.use("/api/unites", unite_router_1.uniteRouter);
app.use("/api/demandes-articles", demandeArticle_router_1.demandeArticlesRouter);
app.use("/api/retours", retour_router_1.retourRouter);
app.use("/api/entree", entree_router_1.entreeRouter);
app.use("/api/sorties", sortie_router_1.sortieRouter);
app.use("/api/documents", document_router_1.documentRouter);
app.use("/api/notifications", notificationRouter_1.notificationsRouter);
app.use("/api/export", export_router_1.exportRouter);
const uploadsPath = path_1.default.join(process.cwd(), "uploads");
app.use("/uploads", express_1.default.static(uploadsPath, { index: false }));
app.use(global_error_handler_1.globalErrorHandler);
(0, swagger_1.setupSwagger)(app);
data_source_1.AppDataSource.initialize()
    .then(() => {
    const PORT = process.env.SERVER_PORT || 4000;
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`✅ Server started on http://0.0.0.0:${PORT}`);
        console.log(`📱 Mobile app can connect via your local IP on port ${PORT}`);
    });
})
    .catch((err) => console.log(err));
//# sourceMappingURL=index.js.map