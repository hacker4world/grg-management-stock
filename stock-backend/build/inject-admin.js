"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const Compte_1 = require("./entity/Compte");
const repositories_1 = require("./repository/repositories");
const bcrypt_util_1 = require("./utilities/bcrypt.util");
async function injectAdmin() {
    try {
        console.log("🌱 Connecting to database...");
        await data_source_1.AppDataSource.initialize();
        console.log("✅ Database connected.");
        console.log("Creating Admin account...");
        const admin = new Compte_1.Compte();
        admin.nom = "Admin";
        admin.prenom = "System";
        admin.nom_utilisateur = "admin_system";
        admin.motdepasse = await (0, bcrypt_util_1.hashPassword)("admin12345678");
        admin.role = "admin";
        admin.confirme = true;
        await repositories_1.compteRepository.save(admin);
        console.log("Admin account has been created.");
    }
    catch (err) {
        console.log("Could not created admin account");
    }
}
injectAdmin();
//# sourceMappingURL=inject-admin.js.map