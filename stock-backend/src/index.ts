import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { AppDataSource } from "./data-source";
import { fournisseurRouter } from "./router/fournisseur.router";
import { fabriquantRouter } from "./router/fabriquant.router";
import { chantierRouter } from "./router/chantier.router";
import { familleRouter } from "./router/classement/famille.router";
import { sousFamillesRouter } from "./router/classement/sousFamilles.router";
import { categoryRouter } from "./router/classement/category.router";
import { articlesRouter } from "./router/articles.router";
import { globalRateLimiter } from "./settings/rate-limit/rate-limiter";
import { compteRouter } from "./router/compte.router";
import { globalErrorHandler } from "./settings/global-error-handler";
import { depotRouter } from "./router/depot.router";
import { uniteRouter } from "./router/unite.router";
import { demandeArticlesRouter } from "./router/demandeArticle.router";
import { retourRouter } from "./router/retour.router";
import { setupSwagger } from "./settings/docs/swagger";
import { entreeRouter } from "./router/entree.router";
import { sortieRouter } from "./router/sortie.router";
import { documentRouter } from "./router/document.router";
import { notificationsRouter } from "./router/notificationRouter";
import { exportRouter } from "./router/export.router";

const app = express();

app.use(helmet());

app.use(cookieParser());

// CORS configuration - Allow mobile app and web frontend
const allowedOrigins = [
  "http://localhost:4200", // Angular web frontend
  "http://localhost:8081", // Expo web
  "http://localhost:19006", // Expo web alt
  "http://10.0.2.2:8081", // Android emulator
];

app.use(
  cors({
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
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(globalRateLimiter);

app.use("/api/fournisseurs", fournisseurRouter);
app.use("/api/fabriquants", fabriquantRouter);
app.use("/api/chantier", chantierRouter);

app.use("/api/classement/familles", familleRouter);
app.use("/api/classement/sous-famille", sousFamillesRouter);
app.use("/api/classement/categorie", categoryRouter);

app.use("/api/articles", articlesRouter);

app.use("/api/authentification", compteRouter);

app.use("/api/depots", depotRouter);
app.use("/api/unites", uniteRouter);

app.use("/api/demandes-articles", demandeArticlesRouter);

app.use("/api/retours", retourRouter);

app.use("/api/entree", entreeRouter);

app.use("/api/sorties", sortieRouter);

app.use("/api/documents", documentRouter);

app.use("/api/notifications", notificationsRouter);

app.use("/api/export", exportRouter);

const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath, { index: false }));

app.use(globalErrorHandler);

setupSwagger(app);

AppDataSource.initialize()
  .then(() => {
    const PORT = process.env.SERVER_PORT || 4000;
    app.listen(Number(PORT) , '0.0.0.0', () => {
      console.log(`✅ Server started on http://0.0.0.0:${PORT}`);
      console.log(
        `📱 Mobile app can connect via your local IP on port ${PORT}`,
      );
    });
  })
  .catch((err) => console.log(err));
