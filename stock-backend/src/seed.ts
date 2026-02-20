import "dotenv/config";
import { AppDataSource } from "./data-source";
import {
  compteRepository,
  familleRepository,
  sousFamillesRepository,
  categoryRepository,
  uniteRepository,
  depotRepository,
  fournisseurRepository,
  fabriquantRepository,
  articlesRepositoy,
  chantierRepository,
} from "./repository/repositories";
import { hashPassword } from "./utilities/bcrypt.util";
import { Compte } from "./entity/Compte";

async function seed() {
  try {
    console.log("🌱 Connecting to database...");
    await AppDataSource.initialize();
    console.log("✅ Database connected.");

    /* -------------------------------------------------------------------------- */
    /*                                 1. ACCOUNTS                                */
    /* -------------------------------------------------------------------------- */
    console.log("Checking accounts...");
    const adminUsername = "admin";
    let admin = await compteRepository.findOneBy({
      nom_utilisateur: adminUsername,
    });

    if (!admin) {
      console.log("Creating Admin account...");
      admin = new Compte();
      admin.nom = "Admin";
      admin.prenom = "System";
      admin.nom_utilisateur = adminUsername;
      admin.motdepasse = await hashPassword("admin123");
      admin.role = "admin";
      admin.confirme = true;
      await compteRepository.save(admin);
    } else {
      console.log("Admin account already exists.");
    }

    const merchantUsername = "mohamed.tounsi";
    let merchant = await compteRepository.findOneBy({
      nom_utilisateur: merchantUsername,
    });

    if (!merchant) {
      console.log("Creating Merchant account...");
      merchant = new Compte();
      merchant.nom = "Tounsi";
      merchant.prenom = "Mohamed";
      merchant.nom_utilisateur = merchantUsername;
      merchant.motdepasse = await hashPassword("123456");
      merchant.role = "merchant";
      merchant.confirme = true;
      await compteRepository.save(merchant);
    }

    // Responsable Chantier account
    const responsableUsername = "ahmed.benali";
    let responsable = await compteRepository.findOneBy({
      nom_utilisateur: responsableUsername,
    });

    if (!responsable) {
      console.log("Creating Responsable Chantier account...");
      responsable = new Compte();
      responsable.nom = "Ben Ali";
      responsable.prenom = "Ahmed";
      responsable.nom_utilisateur = responsableUsername;
      responsable.motdepasse = await hashPassword("123456");
      responsable.role = "responsable-chantier";
      responsable.confirme = true;
      await compteRepository.save(responsable);
    } else {
      console.log("Responsable Chantier account already exists.");
    }

    // Magasinier account (pour entrée stock et confirmation demandes)
    const magazinierUsername = "magasinier";
    let magazinier = await compteRepository.findOneBy({
      nom_utilisateur: magazinierUsername,
    });
    if (!magazinier) {
      console.log("Creating Magasinier account...");
      magazinier = new Compte();
      magazinier.nom = "Magasin";
      magazinier.prenom = "Jean";
      magazinier.nom_utilisateur = magazinierUsername;
      magazinier.motdepasse = await hashPassword("123456");
      magazinier.role = "magazinier";
      magazinier.confirme = true;
      await compteRepository.save(magazinier);
    } else {
      console.log("Magasinier account already exists.");
    }

    /* -------------------------------------------------------------------------- */
    /*                                 2. UNITES                                  */
    /* -------------------------------------------------------------------------- */
    const unites = ["kg", "m", "L", "sac 50kg", "palette", "pce", "tonne", "m3"];
    for (const u of unites) {
      const exists = await uniteRepository.findOneBy({ nom: u });
      if (!exists) {
        await uniteRepository.save({ nom: u });
        console.log(`+ Unite: ${u}`);
      }
    }

    /* -------------------------------------------------------------------------- */
    /*                                  3. DEPOTS                                 */
    /* -------------------------------------------------------------------------- */
    const depotNames = ["Dépôt Ben Arous", "Dépôt Sfax", "Dépôt Tunis"];
    let mainDepot;
    for (const name of depotNames) {
      let d = await depotRepository.findOneBy({ nom: name });
      if (!d) {
        d = await depotRepository.save({ nom: name });
        console.log(`+ Depot: ${name}`);
      }
      if (name === "Dépôt Ben Arous") mainDepot = d;
    }

    /* -------------------------------------------------------------------------- */
    /*                           4. FAMILIES / CATS                               */
    /* -------------------------------------------------------------------------- */

    // ── Helper to upsert entities ──────────────────────────────────────────────
    async function upsertFamille(nom: string) {
      let f = await familleRepository.findOneBy({ nom });
      if (!f) {
        f = await familleRepository.save({ nom });
        console.log(`+ Famille: ${nom}`);
      }
      return f;
    }
    async function upsertSousFamille(nom: string, famille: any) {
      let sf = await sousFamillesRepository.findOneBy({ nom });
      if (!sf) {
        sf = await sousFamillesRepository.save({ nom, famille });
        console.log(`+ Sous-Famille: ${nom}`);
      }
      return sf;
    }
    async function upsertCategorie(nom: string, sous_famille: any) {
      let c = await categoryRepository.findOneBy({ nom });
      if (!c) {
        c = await categoryRepository.save({ nom, sous_famille });
        console.log(`+ Categorie: ${nom}`);
      }
      return c;
    }
    async function upsertFournisseur(nom: string, contact: string, adresse: string) {
      let f = await fournisseurRepository.findOneBy({ nom });
      if (!f) {
        f = await fournisseurRepository.save({ nom, contact, adresse });
        console.log(`+ Fournisseur: ${nom}`);
      }
      return f;
    }
    async function upsertFabriquant(nom: string, contact: string, adresse: string) {
      let f = await fabriquantRepository.findOneBy({ nom });
      if (!f) {
        f = await fabriquantRepository.save({ nom, contact, adresse });
        console.log(`+ Fabriquant: ${nom}`);
      }
      return f;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  Only 2 Familles: "Matériel" (equipment/tools) & "Produit" (materials)
    // ═══════════════════════════════════════════════════════════════════════════

    // ── Famille 1 : Matériel ─────────────────────────────────────────────────
    //    (Équipements, outils, appareils, fixtures — things you install or use)
    const famMateriel = await upsertFamille("Matériel");

    //  Sous-Famille → Catégories
    const sfOutillage      = await upsertSousFamille("Outillage", famMateriel);
    const catMarteaux      = await upsertCategorie("Marteaux & Masses", sfOutillage);
    const catTruelles      = await upsertCategorie("Truelles & Taloches", sfOutillage);

    const sfQuincaillerie  = await upsertSousFamille("Quincaillerie", famMateriel);
    const catBoulons       = await upsertCategorie("Boulons & Écrous", sfQuincaillerie);
    const catChevilles     = await upsertCategorie("Chevilles", sfQuincaillerie);

    const sfAppareillage   = await upsertSousFamille("Appareillage Électrique", famMateriel);
    const catInterrupt     = await upsertCategorie("Interrupteurs", sfAppareillage);
    const catPrises        = await upsertCategorie("Prises", sfAppareillage);

    const sfEclairage      = await upsertSousFamille("Éclairage", famMateriel);
    const catLED           = await upsertCategorie("Éclairage LED", sfEclairage);
    const catProjecteurs   = await upsertCategorie("Projecteurs", sfEclairage);

    const sfRobinetterie   = await upsertSousFamille("Robinetterie", famMateriel);
    const catRobinets      = await upsertCategorie("Robinets", sfRobinetterie);
    const catVannes        = await upsertCategorie("Vannes", sfRobinetterie);

    const sfSanitaire      = await upsertSousFamille("Sanitaire", famMateriel);
    const catWC            = await upsertCategorie("WC", sfSanitaire);
    const catLavabos       = await upsertCategorie("Lavabos", sfSanitaire);

    const sfMenuiserie     = await upsertSousFamille("Menuiserie", famMateriel);
    const catPortes        = await upsertCategorie("Portes", sfMenuiserie);
    const catFenetres      = await upsertCategorie("Fenêtres", sfMenuiserie);

    // ── Famille 2 : Produit ──────────────────────────────────────────────────
    //    (Matières premières, consommables — things you consume/build with)
    const famProduit = await upsertFamille("Produit");

    //  Sous-Famille → Catégories
    const sfLiants         = await upsertSousFamille("Liants", famProduit);
    const catCiments       = await upsertCategorie("Ciments", sfLiants);
    const catChaux         = await upsertCategorie("Chaux", sfLiants);

    const sfBriques        = await upsertSousFamille("Briques & Parpaings", famProduit);
    const catBriquesRouges = await upsertCategorie("Briques Rouges", sfBriques);
    const catParpaings     = await upsertCategorie("Parpaings", sfBriques);

    const sfAggregats      = await upsertSousFamille("Agrégats", famProduit);
    const catSable         = await upsertCategorie("Sable", sfAggregats);
    const catGravier       = await upsertCategorie("Gravier", sfAggregats);

    const sfBetonPrefab    = await upsertSousFamille("Béton Préfabriqué", famProduit);
    const catHourdis       = await upsertCategorie("Hourdis", sfBetonPrefab);
    const catPoutrelles    = await upsertCategorie("Poutrelles", sfBetonPrefab);

    const sfAcier          = await upsertSousFamille("Acier", famProduit);
    const catAcierRond     = await upsertCategorie("Acier Rond", sfAcier);
    const catTreillisSoude = await upsertCategorie("Treillis Soudé", sfAcier);

    const sfPlatre         = await upsertSousFamille("Plâtre & Faux Plafond", famProduit);
    const catPlatre        = await upsertCategorie("Plaques de Plâtre", sfPlatre);
    const catRails         = await upsertCategorie("Rails & Montants", sfPlatre);

    const sfIsolation      = await upsertSousFamille("Isolation", famProduit);
    const catIsolTherm     = await upsertCategorie("Isolation Thermique", sfIsolation);
    const catIsolAcous     = await upsertCategorie("Isolation Acoustique", sfIsolation);

    const sfCables         = await upsertSousFamille("Câbles & Gaines", famProduit);
    const catCablesElec    = await upsertCategorie("Câbles Électriques", sfCables);
    const catGaines        = await upsertCategorie("Gaines", sfCables);

    const sfTuyaux         = await upsertSousFamille("Tuyauterie", famProduit);
    const catTuyauxPVC     = await upsertCategorie("Tuyaux PVC", sfTuyaux);
    const catTuyauxPPR     = await upsertCategorie("Tuyaux PPR", sfTuyaux);

    const sfPeintures      = await upsertSousFamille("Peintures & Enduits", famProduit);
    const catPeintInt      = await upsertCategorie("Peinture Intérieure", sfPeintures);
    const catPeintExt      = await upsertCategorie("Peinture Extérieure", sfPeintures);

    const sfCarrelage      = await upsertSousFamille("Carrelage & Revêtement", famProduit);
    const catCarrMural     = await upsertCategorie("Carrelage Mural", sfCarrelage);
    const catCarrSol       = await upsertCategorie("Carrelage Sol", sfCarrelage);
    const catParquet       = await upsertCategorie("Parquet", sfCarrelage);

    /* -------------------------------------------------------------------------- */
    /*                        5. PROVIDERS / MANUFACTURERS                        */
    /* -------------------------------------------------------------------------- */
    // ── 30 Fournisseurs ────────────────────────────────────────────────────────
    const fournisseursData = [
      {
        nom: "Ciments de Bizerte",
        contact: "72 432 000",
        adresse: "Baie de Sabra, Bizerte",
      },
      { nom: "SOTACIB", contact: "76 280 500", adresse: "Feriana, Kasserine" },
      {
        nom: "CAT Colacem",
        contact: "72 590 300",
        adresse: "Zone Industrielle, Jebel Oust",
      },
      {
        nom: "SOTUVER",
        contact: "71 940 080",
        adresse: "Zone Industrielle, Grombalia",
      },
      { nom: "SAFI Plomberie", contact: "71 601 900", adresse: "Ben Arous" },
      {
        nom: "Distribution Électrique Tunisie",
        contact: "71 340 050",
        adresse: "Charguia 2, Tunis",
      },
      {
        nom: "Astral Peintures",
        contact: "71 428 300",
        adresse: "Mégrine, Ben Arous",
      },
      {
        nom: "SOMOCER",
        contact: "73 475 800",
        adresse: "Zone Industrielle, Kairouan",
      },
      {
        nom: "Batimat",
        contact: "71 750 180",
        adresse: "Route de Bizerte, Ariana",
      },
      {
        nom: "SOTUBI Acier",
        contact: "71 434 500",
        adresse: "Zone Industrielle, Radès",
      },
      {
        nom: "Société Tunisienne de Sidérurgie",
        contact: "72 485 100",
        adresse: "Menzel Bourguiba, Bizerte",
      },
      {
        nom: "SOPAT",
        contact: "71 592 300",
        adresse: "Zone Industrielle, Grombalia",
      },
      {
        nom: "Comptoir National du Bois",
        contact: "71 390 800",
        adresse: "Avenue Mohamed V, Tunis",
      },
      {
        nom: "STIP Plastique",
        contact: "71 434 200",
        adresse: "Zone Industrielle, Radès",
      },
      {
        nom: "Tunisie Câbles",
        contact: "71 428 500",
        adresse: "Mégrine, Ben Arous",
      },
      {
        nom: "Société El Fouladh",
        contact: "73 298 400",
        adresse: "Zone Industrielle, Sousse",
      },
      { nom: "SOCOMENIN", contact: "71 592 700", adresse: "Soliman, Nabeul" },
      {
        nom: "SOTUPAB",
        contact: "71 298 600",
        adresse: "Zone Industrielle, La Charguia",
      },
      {
        nom: "Les Grandes Carrières du Nord",
        contact: "72 440 200",
        adresse: "Menzel Jemil, Bizerte",
      },
      {
        nom: "SOTUCOMET",
        contact: "73 298 100",
        adresse: "Zone Industrielle, M'saken",
      },
      {
        nom: "Magasin Général du Bâtiment",
        contact: "71 801 500",
        adresse: "La Soukra, Ariana",
      },
      {
        nom: "Quincaillerie Centrale",
        contact: "71 256 300",
        adresse: "Rue Charles de Gaulle, Tunis",
      },
      {
        nom: "STIA Aluminium",
        contact: "71 434 800",
        adresse: "Zone Industrielle, Ben Arous",
      },
      {
        nom: "Tunisie Profilés",
        contact: "72 590 600",
        adresse: "Zone Industrielle, Zaghouan",
      },
      {
        nom: "Dépôt Matériaux Sfax",
        contact: "74 220 300",
        adresse: "Route de Tunis, Sfax",
      },
      {
        nom: "Comptoir du Sud",
        contact: "76 225 100",
        adresse: "Zone Industrielle, Gafsa",
      },
      {
        nom: "SAMSE Tunisie",
        contact: "71 770 400",
        adresse: "Centre Urbain Nord, Tunis",
      },
      {
        nom: "Matériaux Modernes",
        contact: "73 280 500",
        adresse: "Route de Monastir, Sousse",
      },
      {
        nom: "Société Sahélienne de Matériaux",
        contact: "73 461 200",
        adresse: "Ksar Hellal, Monastir",
      },
      { nom: "SOGEMAT", contact: "71 601 300", adresse: "Ezzahra, Ben Arous" },
      { nom: "Tunisie Sanitaire", contact: "71 100 200", adresse: "Ariana" },
      {
        nom: "Quincaillerie Moderne",
        contact: "71 300 400",
        adresse: "Sousse",
      },
      { nom: "Bati-Pro", contact: "72 500 600", adresse: "Nabeul" },
      { nom: "Global Matériaux", contact: "74 800 900", adresse: "Sfax" },
      { nom: "Eco-Construction", contact: "75 200 100", adresse: "Gabes" },
      { nom: "Sud Bâtiment", contact: "76 400 300", adresse: "Gafsa" },
      { nom: "Nord Outillage", contact: "78 600 500", adresse: "Béja" },
      { nom: "Tunis Peinture", contact: "71 700 800", adresse: "Ben Arous" },
      { nom: "Alu-Maghreb", contact: "73 900 100", adresse: "Monastir" },
      { nom: "Câblerie du Sud", contact: "74 111 222", adresse: "Sfax" },
      { nom: "Sotufab Meubles", contact: "71 222 333", adresse: "Tunis" },
      { nom: "Bricorama TN", contact: "70 444 555", adresse: "La Marsa" },
      { nom: "Mr Bricolage TN", contact: "70 666 777", adresse: "Menzah" },
      { nom: "Sanitaire Express", contact: "71 888 999", adresse: "Ezzahra" },
      {
        nom: "Feraille de l'Est",
        contact: "72 000 111",
        adresse: "Menzel Bourguiba",
      },
      {
        nom: "Plâtre de Tataouine",
        contact: "75 333 444",
        adresse: "Tataouine",
      },
      { nom: "Marbre de Thala", contact: "77 555 666", adresse: "Kasserine" },
      { nom: "Sable de Tabarka", contact: "78 777 888", adresse: "Tabarka" },
      { nom: "Briqueterie Tozeur", contact: "76 999 000", adresse: "Tozeur" },
      { nom: "Sodibat", contact: "71 123 456", adresse: "Megrine" },
    ];
    for (const f of fournisseursData) {
      await upsertFournisseur(f.nom, f.contact, f.adresse);
    }

    // ── 30 Fabriquants ───────────────────────────────────────────────────────
    const fabriquantsData = [
      {
        nom: "Briqueterie du Sahel",
        contact: "73 500 200",
        adresse: "Jemmel, Monastir",
      },
      {
        nom: "Les Moulins de Tunis",
        contact: "71 261 500",
        adresse: "La Goulette, Tunis",
      },
      {
        nom: "Knauf Tunisie",
        contact: "71 940 150",
        adresse: "Grombalia, Nabeul",
      },
      {
        nom: "Schneider Electric TN",
        contact: "71 862 400",
        adresse: "Les Berges du Lac, Tunis",
      },
      {
        nom: "Sanimed",
        contact: "73 226 700",
        adresse: "Zone Industrielle, Sousse",
      },
      {
        nom: "Menuiserie El Manzah",
        contact: "71 234 800",
        adresse: "El Manzah 6, Tunis",
      },
      {
        nom: "Briqueterie de Nabeul",
        contact: "72 286 500",
        adresse: "Zone Industrielle, Nabeul",
      },
      {
        nom: "Cimenterie d'Enfidha",
        contact: "73 380 400",
        adresse: "Enfidha, Sousse",
      },
      {
        nom: "SOTUCE Céramique",
        contact: "71 434 900",
        adresse: "Zone Industrielle, Ben Arous",
      },
      {
        nom: "SOTUBO Béton",
        contact: "71 592 800",
        adresse: "Soliman, Nabeul",
      },
      {
        nom: "Fonderie Tunisienne",
        contact: "72 440 600",
        adresse: "Menzel Bourguiba, Bizerte",
      },
      {
        nom: "STPC Précontrainte",
        contact: "71 390 200",
        adresse: "Avenue de Carthage, Tunis",
      },
      {
        nom: "Legrand Tunisie",
        contact: "71 862 800",
        adresse: "Les Berges du Lac 2, Tunis",
      },
      {
        nom: "Hager Tunisie",
        contact: "71 940 600",
        adresse: "Zone Industrielle, Grombalia",
      },
      {
        nom: "Nexans Tunisie",
        contact: "71 428 900",
        adresse: "Mégrine, Ben Arous",
      },
      {
        nom: "Grohe Tunisie",
        contact: "71 770 800",
        adresse: "Centre Urbain Nord, Tunis",
      },
      { nom: "IDEAL STANDARD TN", contact: "71 601 700", adresse: "Ben Arous" },
      {
        nom: "Poulina Holding",
        contact: "71 200 300",
        adresse: "Avenue Habib Bourguiba, Tunis",
      },
      {
        nom: "SOPAL",
        contact: "71 434 100",
        adresse: "Zone Industrielle, Radès",
      },
      {
        nom: "SITEX Textiles Industriels",
        contact: "76 620 300",
        adresse: "Zone Industrielle, Ksar Hellal",
      },
      {
        nom: "SOTUPAC Emballage",
        contact: "71 298 900",
        adresse: "La Charguia 1, Tunis",
      },
      {
        nom: "Mosaïque Tunisienne",
        contact: "73 461 800",
        adresse: "Moknine, Monastir",
      },
      {
        nom: "Ceramica Sfaxienne",
        contact: "74 242 600",
        adresse: "Zone Industrielle, Sfax",
      },
      {
        nom: "Usine de Hourdis Borj Cédria",
        contact: "71 430 200",
        adresse: "Borj Cédria, Ben Arous",
      },
      {
        nom: "SOTEMAIL",
        contact: "73 360 500",
        adresse: "Zone Industrielle, Sousse",
      },
      {
        nom: "Société de Bois du Nord",
        contact: "78 620 100",
        adresse: "Zone Industrielle, Tabarka",
      },
      {
        nom: "ABB Tunisie",
        contact: "71 862 100",
        adresse: "Les Berges du Lac 1, Tunis",
      },
      {
        nom: "Philips Lighting TN",
        contact: "71 770 500",
        adresse: "Centre Urbain Nord, Tunis",
      },
      {
        nom: "Saint-Gobain Tunisie",
        contact: "71 940 300",
        adresse: "Zone Industrielle, Grombalia",
      },
      {
        nom: "Weber Tunisie",
        contact: "72 590 100",
        adresse: "Zone Industrielle, Zaghouan",
      },
      { nom: "Céramique du Nord", contact: "72 111 222", adresse: "Bizerte" },
      { nom: "Acier de Carthage", contact: "71 333 444", adresse: "Radès" },
      { nom: "Plomberie Royale", contact: "73 555 666", adresse: "Sousse" },
      { nom: "Lumière de Tunis", contact: "71 777 888", adresse: "Tunis" },
      { nom: "Béton Plus", contact: "74 999 000", adresse: "Sfax" },
      { nom: "Isolant Maghreb", contact: "75 123 456", adresse: "Medenine" },
      { nom: "Portes du Sahel", contact: "73 234 567", adresse: "Mahdia" },
      { nom: "Verre de Tunisie", contact: "72 345 678", adresse: "Grombalia" },
      { nom: "Chimie Bâtiment", contact: "71 456 789", adresse: "Ben Arous" },
      { nom: "Outillage Pro TN", contact: "70 567 890", adresse: "Ariana" },
      { nom: "Sika Tunisie", contact: "71 678 901", adresse: "Tunis" },
      { nom: "Jotun Tunisie", contact: "71 789 012", adresse: "Mghira" },
      { nom: "General Electric TN", contact: "71 890 123", adresse: "Tunis" },
      { nom: "Villeroy & Boch TN", contact: "71 901 234", adresse: "Tunis" },
      { nom: "Delta Cuisine", contact: "71 012 345", adresse: "La Soukra" },
      { nom: "Somatral", contact: "71 123 456", adresse: "Ben Arous" },
      { nom: "Sotrapil", contact: "71 234 567", adresse: "Tunis" },
      { nom: "Stafim", contact: "71 345 678", adresse: "Tunis" },
      { nom: "Ennakl", contact: "71 456 789", adresse: "Tunis" },
      { nom: "TotalEnergies TN", contact: "71 567 890", adresse: "Tunis" },
    ];
    for (const f of fabriquantsData) {
      await upsertFabriquant(f.nom, f.contact, f.adresse);
    }

    /* -------------------------------------------------------------------------- */
    /*                                 6. ARTICLES                                */
    /* -------------------------------------------------------------------------- */

    // Fetch all units for use
    const uniteSac    = await uniteRepository.findOneBy({ nom: "sac 50kg" });
    const unitePce    = await uniteRepository.findOneBy({ nom: "pce" });
    const uniteKg     = await uniteRepository.findOneBy({ nom: "kg" });
    const uniteM      = await uniteRepository.findOneBy({ nom: "m" });
    const uniteL      = await uniteRepository.findOneBy({ nom: "L" });
    const uniteTonne  = await uniteRepository.findOneBy({ nom: "tonne" });
    const uniteM3     = await uniteRepository.findOneBy({ nom: "m3" });
    const unitePalette = await uniteRepository.findOneBy({ nom: "palette" });

    // Fetch all depots
    const depotBenArous = await depotRepository.findOneBy({ nom: "Dépôt Ben Arous" });
    const depotSfax     = await depotRepository.findOneBy({ nom: "Dépôt Sfax" });
    const depotTunis    = await depotRepository.findOneBy({ nom: "Dépôt Tunis" });

    // All articles with non-zero prices (DT = Dinar Tunisien)
    const articlesData = [
      // ── Gros Œuvre ─────────────────────────────────────────────────────────
      {
        nom: "Ciment CPJ 45",
        stockMinimum: 100,
        stockActuel: 1000,
        prixMoyenne: 18.5,
        depot: depotBenArous,
        categorie: catCiments,
        unite: uniteSac,
      },
      {
        nom: "Ciment CEM II 32.5",
        stockMinimum: 80,
        stockActuel: 600,
        prixMoyenne: 17.2,
        depot: depotSfax,
        categorie: catCiments,
        unite: uniteSac,
      },
      {
        nom: "Ciment Blanc CEM I 52.5",
        stockMinimum: 30,
        stockActuel: 150,
        prixMoyenne: 32.0,
        depot: depotTunis,
        categorie: catCiments,
        unite: uniteSac,
      },
      {
        nom: "Chaux Hydraulique NHL 3.5",
        stockMinimum: 50,
        stockActuel: 200,
        prixMoyenne: 12.5,
        depot: depotBenArous,
        categorie: catChaux,
        unite: uniteSac,
      },
      {
        nom: "Brique 12 Trous",
        stockMinimum: 5000,
        stockActuel: 50000,
        prixMoyenne: 0.85,
        depot: depotBenArous,
        categorie: catBriquesRouges,
        unite: unitePce,
      },
      {
        nom: "Brique 8 Trous",
        stockMinimum: 5000,
        stockActuel: 35000,
        prixMoyenne: 0.62,
        depot: depotSfax,
        categorie: catBriquesRouges,
        unite: unitePce,
      },
      {
        nom: "Brique Pleine 6x10x22",
        stockMinimum: 3000,
        stockActuel: 20000,
        prixMoyenne: 0.45,
        depot: depotBenArous,
        categorie: catBriquesRouges,
        unite: unitePce,
      },
      {
        nom: "Parpaing 20x20x50",
        stockMinimum: 2000,
        stockActuel: 15000,
        prixMoyenne: 1.35,
        depot: depotTunis,
        categorie: catParpaings,
        unite: unitePce,
      },
      {
        nom: "Parpaing 15x20x50",
        stockMinimum: 2000,
        stockActuel: 12000,
        prixMoyenne: 1.1,
        depot: depotBenArous,
        categorie: catParpaings,
        unite: unitePce,
      },
      {
        nom: "Sable Fin 0/2",
        stockMinimum: 20,
        stockActuel: 150,
        prixMoyenne: 45.0,
        depot: depotBenArous,
        categorie: catSable,
        unite: uniteM3,
      },
      {
        nom: "Sable Concassé 0/4",
        stockMinimum: 15,
        stockActuel: 100,
        prixMoyenne: 52.0,
        depot: depotSfax,
        categorie: catSable,
        unite: uniteM3,
      },
      {
        nom: "Gravier 5/15",
        stockMinimum: 20,
        stockActuel: 120,
        prixMoyenne: 48.0,
        depot: depotBenArous,
        categorie: catGravier,
        unite: uniteM3,
      },
      {
        nom: "Gravier 15/25",
        stockMinimum: 15,
        stockActuel: 80,
        prixMoyenne: 50.0,
        depot: depotTunis,
        categorie: catGravier,
        unite: uniteM3,
      },
      {
        nom: "Hourdis 16x20x53",
        stockMinimum: 1000,
        stockActuel: 8000,
        prixMoyenne: 1.8,
        depot: depotBenArous,
        categorie: catHourdis,
        unite: unitePce,
      },
      {
        nom: "Hourdis 20x20x53",
        stockMinimum: 800,
        stockActuel: 5000,
        prixMoyenne: 2.2,
        depot: depotSfax,
        categorie: catHourdis,
        unite: unitePce,
      },
      {
        nom: "Poutrelle Précontrainte 4m",
        stockMinimum: 50,
        stockActuel: 300,
        prixMoyenne: 22.5,
        depot: depotBenArous,
        categorie: catPoutrelles,
        unite: unitePce,
      },
      {
        nom: "Poutrelle Précontrainte 5m",
        stockMinimum: 40,
        stockActuel: 200,
        prixMoyenne: 28.0,
        depot: depotTunis,
        categorie: catPoutrelles,
        unite: unitePce,
      },
      {
        nom: "Acier Rond HA 10mm",
        stockMinimum: 5,
        stockActuel: 40,
        prixMoyenne: 2850.0,
        depot: depotBenArous,
        categorie: catAcierRond,
        unite: uniteTonne,
      },
      {
        nom: "Acier Rond HA 12mm",
        stockMinimum: 5,
        stockActuel: 35,
        prixMoyenne: 2800.0,
        depot: depotSfax,
        categorie: catAcierRond,
        unite: uniteTonne,
      },
      {
        nom: "Acier Rond HA 16mm",
        stockMinimum: 3,
        stockActuel: 20,
        prixMoyenne: 2750.0,
        depot: depotTunis,
        categorie: catAcierRond,
        unite: uniteTonne,
      },
      {
        nom: "Treillis Soudé ST25C",
        stockMinimum: 50,
        stockActuel: 300,
        prixMoyenne: 38.5,
        depot: depotBenArous,
        categorie: catTreillisSoude,
        unite: unitePce,
      },
      {
        nom: "Treillis Soudé ST50C",
        stockMinimum: 30,
        stockActuel: 180,
        prixMoyenne: 55.0,
        depot: depotSfax,
        categorie: catTreillisSoude,
        unite: unitePce,
      },

      // ── Second Œuvre ───────────────────────────────────────────────────────
      {
        nom: "Plaque de Plâtre BA13",
        stockMinimum: 200,
        stockActuel: 1500,
        prixMoyenne: 12.8,
        depot: depotBenArous,
        categorie: catPlatre,
        unite: unitePce,
      },
      {
        nom: "Plaque de Plâtre Hydrofuge",
        stockMinimum: 100,
        stockActuel: 600,
        prixMoyenne: 18.5,
        depot: depotTunis,
        categorie: catPlatre,
        unite: unitePce,
      },
      {
        nom: "Rail R48",
        stockMinimum: 100,
        stockActuel: 800,
        prixMoyenne: 4.2,
        depot: depotBenArous,
        categorie: catRails,
        unite: unitePce,
      },
      {
        nom: "Montant M48",
        stockMinimum: 100,
        stockActuel: 700,
        prixMoyenne: 4.5,
        depot: depotBenArous,
        categorie: catRails,
        unite: unitePce,
      },
      {
        nom: "Polystyrène Expansé 5cm",
        stockMinimum: 100,
        stockActuel: 500,
        prixMoyenne: 8.2,
        depot: depotSfax,
        categorie: catIsolTherm,
        unite: unitePce,
      },
      {
        nom: "Laine de Roche 50mm",
        stockMinimum: 50,
        stockActuel: 300,
        prixMoyenne: 15.8,
        depot: depotTunis,
        categorie: catIsolAcous,
        unite: unitePce,
      },
      {
        nom: "Porte Intérieure Bois 83cm",
        stockMinimum: 10,
        stockActuel: 50,
        prixMoyenne: 185.0,
        depot: depotBenArous,
        categorie: catPortes,
        unite: unitePce,
      },
      {
        nom: "Porte Blindée Extérieure",
        stockMinimum: 5,
        stockActuel: 20,
        prixMoyenne: 950.0,
        depot: depotTunis,
        categorie: catPortes,
        unite: unitePce,
      },
      {
        nom: "Fenêtre PVC 120x100",
        stockMinimum: 10,
        stockActuel: 40,
        prixMoyenne: 320.0,
        depot: depotBenArous,
        categorie: catFenetres,
        unite: unitePce,
      },
      {
        nom: "Fenêtre Alu Coulissante 150x120",
        stockMinimum: 8,
        stockActuel: 25,
        prixMoyenne: 480.0,
        depot: depotTunis,
        categorie: catFenetres,
        unite: unitePce,
      },

      // ── Plomberie ──────────────────────────────────────────────────────────
      {
        nom: "Tuyau PVC Ø100mm (4m)",
        stockMinimum: 50,
        stockActuel: 400,
        prixMoyenne: 18.5,
        depot: depotBenArous,
        categorie: catTuyauxPVC,
        unite: unitePce,
      },
      {
        nom: "Tuyau PVC Ø50mm (4m)",
        stockMinimum: 80,
        stockActuel: 500,
        prixMoyenne: 8.2,
        depot: depotSfax,
        categorie: catTuyauxPVC,
        unite: unitePce,
      },
      {
        nom: "Tuyau PVC Ø32mm (4m)",
        stockMinimum: 100,
        stockActuel: 600,
        prixMoyenne: 5.8,
        depot: depotBenArous,
        categorie: catTuyauxPVC,
        unite: unitePce,
      },
      {
        nom: "Tuyau PPR Ø25mm (4m)",
        stockMinimum: 60,
        stockActuel: 350,
        prixMoyenne: 6.5,
        depot: depotBenArous,
        categorie: catTuyauxPPR,
        unite: unitePce,
      },
      {
        nom: "Tuyau PPR Ø20mm (4m)",
        stockMinimum: 80,
        stockActuel: 450,
        prixMoyenne: 4.8,
        depot: depotTunis,
        categorie: catTuyauxPPR,
        unite: unitePce,
      },
      {
        nom: "Robinet Mélangeur Lavabo",
        stockMinimum: 15,
        stockActuel: 80,
        prixMoyenne: 75.0,
        depot: depotBenArous,
        categorie: catRobinets,
        unite: unitePce,
      },
      {
        nom: "Robinet Mélangeur Cuisine",
        stockMinimum: 10,
        stockActuel: 50,
        prixMoyenne: 95.0,
        depot: depotTunis,
        categorie: catRobinets,
        unite: unitePce,
      },
      {
        nom: "Vanne d'Arrêt Ø20mm",
        stockMinimum: 30,
        stockActuel: 200,
        prixMoyenne: 8.5,
        depot: depotBenArous,
        categorie: catVannes,
        unite: unitePce,
      },
      {
        nom: "Vanne Papillon Ø50mm",
        stockMinimum: 10,
        stockActuel: 60,
        prixMoyenne: 42.0,
        depot: depotSfax,
        categorie: catVannes,
        unite: unitePce,
      },
      {
        nom: "WC Complet avec Réservoir",
        stockMinimum: 5,
        stockActuel: 30,
        prixMoyenne: 280.0,
        depot: depotBenArous,
        categorie: catWC,
        unite: unitePce,
      },
      {
        nom: "WC Suspendu",
        stockMinimum: 3,
        stockActuel: 15,
        prixMoyenne: 450.0,
        depot: depotTunis,
        categorie: catWC,
        unite: unitePce,
      },
      {
        nom: "Lavabo Céramique 60cm",
        stockMinimum: 10,
        stockActuel: 45,
        prixMoyenne: 85.0,
        depot: depotBenArous,
        categorie: catLavabos,
        unite: unitePce,
      },
      {
        nom: "Lavabo Double Vasque",
        stockMinimum: 5,
        stockActuel: 20,
        prixMoyenne: 220.0,
        depot: depotTunis,
        categorie: catLavabos,
        unite: unitePce,
      },

      // ── Électricité ────────────────────────────────────────────────────────
      {
        nom: "Câble H07VU 1.5mm² Rouge",
        stockMinimum: 500,
        stockActuel: 3000,
        prixMoyenne: 1.2,
        depot: depotBenArous,
        categorie: catCablesElec,
        unite: uniteM,
      },
      {
        nom: "Câble H07VU 2.5mm² Bleu",
        stockMinimum: 500,
        stockActuel: 2500,
        prixMoyenne: 1.85,
        depot: depotBenArous,
        categorie: catCablesElec,
        unite: uniteM,
      },
      {
        nom: "Câble R2V 3G2.5mm²",
        stockMinimum: 200,
        stockActuel: 1200,
        prixMoyenne: 4.5,
        depot: depotTunis,
        categorie: catCablesElec,
        unite: uniteM,
      },
      {
        nom: "Gaine ICTA Ø20mm (50m)",
        stockMinimum: 20,
        stockActuel: 120,
        prixMoyenne: 22.0,
        depot: depotBenArous,
        categorie: catGaines,
        unite: unitePce,
      },
      {
        nom: "Gaine ICTA Ø25mm (50m)",
        stockMinimum: 15,
        stockActuel: 80,
        prixMoyenne: 28.0,
        depot: depotSfax,
        categorie: catGaines,
        unite: unitePce,
      },
      {
        nom: "Interrupteur Simple Blanc",
        stockMinimum: 50,
        stockActuel: 400,
        prixMoyenne: 6.5,
        depot: depotBenArous,
        categorie: catInterrupt,
        unite: unitePce,
      },
      {
        nom: "Interrupteur Double",
        stockMinimum: 30,
        stockActuel: 250,
        prixMoyenne: 12.0,
        depot: depotTunis,
        categorie: catInterrupt,
        unite: unitePce,
      },
      {
        nom: "Interrupteur Va-et-Vient",
        stockMinimum: 30,
        stockActuel: 200,
        prixMoyenne: 9.8,
        depot: depotBenArous,
        categorie: catInterrupt,
        unite: unitePce,
      },
      {
        nom: "Prise 2P+T 16A Blanc",
        stockMinimum: 80,
        stockActuel: 500,
        prixMoyenne: 5.5,
        depot: depotBenArous,
        categorie: catPrises,
        unite: unitePce,
      },
      {
        nom: "Prise Double 2P+T 16A",
        stockMinimum: 40,
        stockActuel: 300,
        prixMoyenne: 14.5,
        depot: depotTunis,
        categorie: catPrises,
        unite: unitePce,
      },
      {
        nom: "Spot LED Encastrable 7W",
        stockMinimum: 50,
        stockActuel: 350,
        prixMoyenne: 12.5,
        depot: depotBenArous,
        categorie: catLED,
        unite: unitePce,
      },
      {
        nom: "Panneau LED 60x60 40W",
        stockMinimum: 20,
        stockActuel: 100,
        prixMoyenne: 65.0,
        depot: depotTunis,
        categorie: catLED,
        unite: unitePce,
      },
      {
        nom: "Réglette LED 120cm 36W",
        stockMinimum: 30,
        stockActuel: 180,
        prixMoyenne: 28.0,
        depot: depotSfax,
        categorie: catLED,
        unite: unitePce,
      },
      {
        nom: "Projecteur LED 50W Extérieur",
        stockMinimum: 10,
        stockActuel: 60,
        prixMoyenne: 55.0,
        depot: depotBenArous,
        categorie: catProjecteurs,
        unite: unitePce,
      },
      {
        nom: "Projecteur LED 100W Chantier",
        stockMinimum: 5,
        stockActuel: 25,
        prixMoyenne: 95.0,
        depot: depotTunis,
        categorie: catProjecteurs,
        unite: unitePce,
      },

      // ── Peinture & Revêtement ──────────────────────────────────────────────
      {
        nom: "Peinture Vinylique Blanche 15L",
        stockMinimum: 20,
        stockActuel: 120,
        prixMoyenne: 85.0,
        depot: depotBenArous,
        categorie: catPeintInt,
        unite: unitePce,
      },
      {
        nom: "Peinture Acrylique Satinée 10L",
        stockMinimum: 15,
        stockActuel: 80,
        prixMoyenne: 125.0,
        depot: depotTunis,
        categorie: catPeintInt,
        unite: unitePce,
      },
      {
        nom: "Peinture Façade Extérieure 15L",
        stockMinimum: 10,
        stockActuel: 50,
        prixMoyenne: 145.0,
        depot: depotBenArous,
        categorie: catPeintExt,
        unite: unitePce,
      },
      {
        nom: "Enduit Extérieur 25kg",
        stockMinimum: 30,
        stockActuel: 200,
        prixMoyenne: 22.0,
        depot: depotSfax,
        categorie: catPeintExt,
        unite: uniteSac,
      },
      {
        nom: "Carrelage Mural 25x40 Blanc",
        stockMinimum: 50,
        stockActuel: 300,
        prixMoyenne: 18.5,
        depot: depotBenArous,
        categorie: catCarrMural,
        unite: uniteM,
      },
      {
        nom: "Carrelage Mural Faïence Déco",
        stockMinimum: 30,
        stockActuel: 150,
        prixMoyenne: 35.0,
        depot: depotTunis,
        categorie: catCarrMural,
        unite: uniteM,
      },
      {
        nom: "Carrelage Sol Grès 45x45",
        stockMinimum: 80,
        stockActuel: 500,
        prixMoyenne: 22.0,
        depot: depotBenArous,
        categorie: catCarrSol,
        unite: uniteM,
      },
      {
        nom: "Carrelage Sol Imitation Bois",
        stockMinimum: 40,
        stockActuel: 250,
        prixMoyenne: 42.0,
        depot: depotTunis,
        categorie: catCarrSol,
        unite: uniteM,
      },
      {
        nom: "Parquet Stratifié 8mm",
        stockMinimum: 50,
        stockActuel: 300,
        prixMoyenne: 28.0,
        depot: depotBenArous,
        categorie: catParquet,
        unite: uniteM,
      },

      // ── Outillage & Quincaillerie ──────────────────────────────────────────
      {
        nom: "Marteau Coffreur 600g",
        stockMinimum: 10,
        stockActuel: 50,
        prixMoyenne: 25.0,
        depot: depotBenArous,
        categorie: catMarteaux,
        unite: unitePce,
      },
      {
        nom: "Masse 3kg",
        stockMinimum: 5,
        stockActuel: 20,
        prixMoyenne: 45.0,
        depot: depotSfax,
        categorie: catMarteaux,
        unite: unitePce,
      },
      {
        nom: "Truelle Langue de Chat 18cm",
        stockMinimum: 15,
        stockActuel: 80,
        prixMoyenne: 8.5,
        depot: depotBenArous,
        categorie: catTruelles,
        unite: unitePce,
      },
      {
        nom: "Taloche Éponge 14x28",
        stockMinimum: 10,
        stockActuel: 60,
        prixMoyenne: 12.0,
        depot: depotBenArous,
        categorie: catTruelles,
        unite: unitePce,
      },
      {
        nom: "Boulon HM 10x80 (boîte 50)",
        stockMinimum: 20,
        stockActuel: 100,
        prixMoyenne: 18.5,
        depot: depotBenArous,
        categorie: catBoulons,
        unite: unitePce,
      },
      {
        nom: "Écrou H M10 (boîte 100)",
        stockMinimum: 20,
        stockActuel: 120,
        prixMoyenne: 12.0,
        depot: depotSfax,
        categorie: catBoulons,
        unite: unitePce,
      },
      {
        nom: "Cheville Nylon 8x40 (boîte 100)",
        stockMinimum: 30,
        stockActuel: 200,
        prixMoyenne: 8.5,
        depot: depotBenArous,
        categorie: catChevilles,
        unite: unitePce,
      },
      {
        nom: "Cheville Métallique 10x60 (boîte 50)",
        stockMinimum: 15,
        stockActuel: 80,
        prixMoyenne: 22.0,
        depot: depotTunis,
        categorie: catChevilles,
        unite: unitePce,
      },
      {
        nom: "Colle Carrelage 25kg",
        stockMinimum: 40,
        stockActuel: 300,
        prixMoyenne: 14.5,
        depot: depotBenArous,
        categorie: catCarrSol,
        unite: uniteSac,
      },
      {
        nom: "Joint Carrelage Blanc 5kg",
        stockMinimum: 20,
        stockActuel: 150,
        prixMoyenne: 8.2,
        depot: depotSfax,
        categorie: catCarrSol,
        unite: unitePce,
      },
      {
        nom: "Silicone Sanitaire Transparent",
        stockMinimum: 50,
        stockActuel: 200,
        prixMoyenne: 6.5,
        depot: depotTunis,
        categorie: catChevilles,
        unite: unitePce,
      },
      {
        nom: "Mousse Polyuréthane 750ml",
        stockMinimum: 30,
        stockActuel: 120,
        prixMoyenne: 12.0,
        depot: depotBenArous,
        categorie: catIsolTherm,
        unite: unitePce,
      },
      {
        nom: "Vis Placo 25mm (boite 1000)",
        stockMinimum: 10,
        stockActuel: 50,
        prixMoyenne: 18.0,
        depot: depotBenArous,
        categorie: catBoulons,
        unite: unitePce,
      },
      {
        nom: "Bande à Joint 150m",
        stockMinimum: 20,
        stockActuel: 100,
        prixMoyenne: 9.5,
        depot: depotTunis,
        categorie: catPlatre,
        unite: unitePce,
      },
      {
        nom: "Enduit de Lissage 25kg",
        stockMinimum: 40,
        stockActuel: 250,
        prixMoyenne: 16.8,
        depot: depotSfax,
        categorie: catPeintInt,
        unite: uniteSac,
      },
      {
        nom: "Primaire d'Accrochage 10L",
        stockMinimum: 15,
        stockActuel: 60,
        prixMoyenne: 45.0,
        depot: depotBenArous,
        categorie: catPeintInt,
        unite: unitePce,
      },
      {
        nom: "Siphon Lavabo PVC",
        stockMinimum: 30,
        stockActuel: 150,
        prixMoyenne: 4.5,
        depot: depotTunis,
        categorie: catRobinets,
        unite: unitePce,
      },
      {
        nom: "Flexible Sanitaire 3/8",
        stockMinimum: 50,
        stockActuel: 300,
        prixMoyenne: 7.2,
        depot: depotBenArous,
        categorie: catRobinets,
        unite: unitePce,
      },
      {
        nom: "Disjoncteur 16A",
        stockMinimum: 20,
        stockActuel: 100,
        prixMoyenne: 11.5,
        depot: depotTunis,
        categorie: catPrises,
        unite: unitePce,
      },
      {
        nom: "Tableau Électrique 12 Modules",
        stockMinimum: 5,
        stockActuel: 25,
        prixMoyenne: 35.0,
        depot: depotBenArous,
        categorie: catPrises,
        unite: unitePce,
      },
      {
        nom: "Scie à Métaux",
        stockMinimum: 10,
        stockActuel: 40,
        prixMoyenne: 15.0,
        depot: depotSfax,
        categorie: catMarteaux,
        unite: unitePce,
      },
      {
        nom: "Niveau à Bulle 60cm",
        stockMinimum: 5,
        stockActuel: 20,
        prixMoyenne: 28.0,
        depot: depotBenArous,
        categorie: catMarteaux,
        unite: unitePce,
      },
      {
        nom: "Mètre Ruban 5m",
        stockMinimum: 20,
        stockActuel: 80,
        prixMoyenne: 6.5,
        depot: depotTunis,
        categorie: catMarteaux,
        unite: unitePce,
      },
      {
        nom: "Pince Universelle",
        stockMinimum: 15,
        stockActuel: 60,
        prixMoyenne: 14.0,
        depot: depotBenArous,
        categorie: catMarteaux,
        unite: unitePce,
      },
      {
        nom: "Tournevis Testeur",
        stockMinimum: 30,
        stockActuel: 120,
        prixMoyenne: 3.5,
        depot: depotSfax,
        categorie: catInterrupt,
        unite: unitePce,
      },
      {
        nom: "Gants de Chantier",
        stockMinimum: 100,
        stockActuel: 500,
        prixMoyenne: 2.5,
        depot: depotBenArous,
        categorie: catMarteaux,
        unite: unitePce,
      },
      {
        nom: "Casque de Sécurité",
        stockMinimum: 20,
        stockActuel: 100,
        prixMoyenne: 12.0,
        depot: depotTunis,
        categorie: catMarteaux,
        unite: unitePce,
      },
      {
        nom: "Gilet Haute Visibilité",
        stockMinimum: 50,
        stockActuel: 200,
        prixMoyenne: 5.0,
        depot: depotBenArous,
        categorie: catMarteaux,
        unite: unitePce,
      },
    ];

    for (const artData of articlesData) {
      const exists = await articlesRepositoy.findOneBy({ nom: artData.nom });
      if (!exists && artData.unite && artData.categorie && artData.depot) {
        await articlesRepositoy.save(artData);
        console.log(`+ Article: ${artData.nom} (${artData.prixMoyenne} DT)`);
      }
    }

    /* -------------------------------------------------------------------------- */
    /*                                7. CHANTIERS                                */
    /* -------------------------------------------------------------------------- */
    // Chantiers for merchant (15 chantiers)
    const merchantChantiers = [
      { nom: "Résidence Les Jasmins", adresse: "Avenue Hédi Nouira, Ennasr 2" },
      { nom: "Villa Mr. Trabelsi", adresse: "Rue des Orangers, La Marsa" },
      {
        nom: "Immeuble Carthage Gardens",
        adresse: "Rue de Carthage, Sidi Bou Saïd",
      },
      {
        nom: "Résidence El Bouhaira",
        adresse: "Rue du Lac Biwa, Les Berges du Lac",
      },
      { nom: "Villa Dar Chaabane", adresse: "Route Touristique, Dar Chaabane" },
      {
        nom: "Résidence Les Palmiers",
        adresse: "Rue de Palestine, El Menzah 5",
      },
      {
        nom: "Villa Bou Kornine",
        adresse: "Chemin de Bou Kornine, Hammam-Lif",
      },
      {
        nom: "Immeuble Le Belvédère",
        adresse: "Avenue de la Liberté, Belvédère, Tunis",
      },
      { nom: "Lotissement Ennasr 3", adresse: "Rue de l'Artisanat, Ennasr 3" },
      {
        nom: "Résidence La Perle Bleue",
        adresse: "Avenue Habib Bourguiba, Marsa Plage",
      },
      {
        nom: "Villa Jardins de Carthage",
        adresse: "Rue Ulysse, Carthage Byrsa",
      },
      { nom: "Duplex Aïn Zaghouan", adresse: "Rue Aïn Zaghouan, El Manar" },
      {
        nom: "Résidence Riadh El Fath",
        adresse: "Boulevard Yasser Arafat, La Soukra",
      },
      {
        nom: "Promotion Immobilière El Agba",
        adresse: "Route de la Manouba, El Agba",
      },
      {
        nom: "Immeuble Bureau Centre Urbain",
        adresse: "Centre Urbain Nord, Ariana",
      },
      { nom: "Rénovation Médina", adresse: "Bab Souika, Tunis" },
      { nom: "Extension Port Rades", adresse: "Zone Portuaire, Radès" },
      { nom: "Pont de Bizerte", adresse: "Canal de Bizerte" },
      { nom: "Faculté de Médecine", adresse: "Avenue Djebel Lakhdar, Tunis" },
      {
        nom: "Théâtre Municipal Sousse",
        adresse: "Avenue Habib Bourguiba, Sousse",
      },
      { nom: "Bibliothèque Nationale", adresse: "Boulevard 9 Avril, Tunis" },
      { nom: "Stade de Gabès", adresse: "Zone Sportive, Gabès" },
      { nom: "Aéroport Tunis-Carthage Extension", adresse: "Charguia, Tunis" },
      { nom: "Technopole El Ghazala", adresse: "Route de Raoued, Ariana" },
      { nom: "Zone Industrielle Utique", adresse: "Route de Bizerte, Utique" },
      { nom: "Résidence Les Lilas", adresse: "L'Aouina, Tunis" },
      { nom: "Villa Gammarth", adresse: "Les Côtes de Carthage" },
      { nom: "Immeuble Sfax El Jadida", adresse: "Sfax Centre" },
      { nom: "Centre de Santé Kairouan", adresse: "Kairouan Ville" },
      { nom: "Hôtel Monastir Palace", adresse: "Zone Skanes, Monastir" },
      {
        nom: "Usine Textile Ksar Hellal",
        adresse: "Zone Industrielle, Monastir",
      },
      { nom: "Barrage Sidi Salem", adresse: "Testour, Béja" },
      { nom: "Centrale Électrique Sousse", adresse: "Sidi Abdelhamid, Sousse" },
      { nom: "Port de Pêche Kelibia", adresse: "Kelibia, Nabeul" },
      { nom: "Cité de la Culture", adresse: "Avenue Mohamed V, Tunis" },
    ];
    for (const ch of merchantChantiers) {
      const exists = await chantierRepository.findOneBy({ nom: ch.nom });
      if (!exists && merchant) {
        await chantierRepository.save({ ...ch, compte: merchant });
        console.log(`+ Chantier: ${ch.nom}`);
      }
    }

    // Chantiers for responsable-chantier (Ahmed Ben Ali) (15 chantiers)
    const responsableChantiers = [
      { nom: "Tour Azur",                        adresse: "Boulevard 7 Novembre, Lac 2" },
      { nom: "Centre Commercial El Manar",       adresse: "Route de la Marsa, El Manar" },
      { nom: "Complexe Sportif Rades",           adresse: "Zone Olympique, Radès" },
      { nom: "Hôtel Sidi Bou Saïd",             adresse: "Rue Habib Thameur, Sidi Bou Saïd" },
      { nom: "Clinique Les Oliviers",            adresse: "Avenue Farhat Hached, Sousse" },
      { nom: "Mosquée El Hikma",                 adresse: "Rue Ibn Khaldoun, Centre Ville, Tunis" },
      { nom: "École Primaire El Amal",           adresse: "Cité El Khadra, Tunis" },
      { nom: "Hôpital Régional Jendouba",        adresse: "Avenue de l'Environnement, Jendouba" },
      { nom: "Entrepôt Logistique Mghira",       adresse: "Zone Industrielle, Mghira, Ben Arous" },
      { nom: "Station de Service Autoroute A1",  adresse: "PK 45, Autoroute A1, Grombalia" },
      { nom: "Résidence Universitaire Manouba",  adresse: "Campus Universitaire, Manouba" },
      { nom: "Salle de Sport Atlas",             adresse: "Avenue de la République, Sfax" },
      { nom: "Tour de Bureaux Lac 3",            adresse: "Rue du Lac Leman, Lac 3, Tunis" },
      { nom: "Complexe Résidentiel Hammamet",    adresse: "Zone Touristique, Hammamet Nord" },
      { nom: "Usine Agroalimentaire Béja",       adresse: "Zone Industrielle, Béja" },
    ];
    for (const ch of responsableChantiers) {
      const exists = await chantierRepository.findOneBy({ nom: ch.nom });
      if (!exists && responsable) {
        await chantierRepository.save({ ...ch, compte: responsable });
        console.log(`+ Chantier: ${ch.nom} (responsable-chantier)`);
      }
    }

    console.log("✅ Seeding completed successfully! (Tunisian Data)");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

seed();