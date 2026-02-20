import { AppDataSource } from "./data-source";
import { Compte } from "./entity/Compte";
import { compteRepository } from "./repository/repositories";
import { hashPassword } from "./utilities/bcrypt.util";

async function injectAdmin() {
  try {
    console.log("🌱 Connecting to database...");
    await AppDataSource.initialize();
    console.log("✅ Database connected.");

    console.log("Creating Admin account...");
    const admin = new Compte();
    admin.nom = "Admin";
    admin.prenom = "System";
    admin.nom_utilisateur = "admin_system";
    admin.motdepasse = await hashPassword("admin12345678");
    admin.role = "admin";
    admin.confirme = true;
    await compteRepository.save(admin);
    console.log("Admin account has been created.");
  } catch (err) {
    console.log("Could not created admin account");
  }
}

injectAdmin();
