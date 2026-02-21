# Document Generation — Fiche d'Expedition & Bon de Livraison

> **Date:** 14 Fevrier 2026
> **Version:** 1.0
> **Auteur:** Backend Team

---

## Table des matieres

1. [Resume des changements](#1-resume-des-changements)
2. [Migration base de donnees](#2-migration-base-de-donnees)
3. [Fichiers modifies](#3-fichiers-modifies)
4. [Les 3 types de documents generes](#4-les-3-types-de-documents-generes)
5. [Workflows & API Endpoints](#5-workflows--api-endpoints)
6. [Exemples de payloads](#6-exemples-de-payloads)
7. [Instructions pour les developpeurs](#7-instructions-pour-les-developpeurs)

---

## 1. Resume des changements

### Objectif

Implementer la generation automatique de deux types de documents PDF lors de la confirmation de sorties :

| Document | Contexte | Declencheur |
|---|---|---|
| **Fiche d'Expedition** | Mouvements internes (depot → chantier, depot → depot) | Confirmation d'une `Sortie` avec `typeSortie = "interne"` |
| **Bon de Livraison** | Livraisons clients externes | Confirmation d'une `Sortie` avec `typeSortie = "externe"` |
| **Fiche d'Expedition** (demande) | Demande d'articles confirmee | Confirmation d'une `DemandeArticle` |

### Ce qui change

- La `Sortie` supporte maintenant **2 types** : `interne` et `externe`
- Un depot peut avoir une **adresse** (utile pour le bloc destinataire)
- La sortie externe stocke les infos du **client destinataire** (nom, adresse, matricule fiscal)
- La sortie interne peut cibler un **chantier** OU un **depot destinataire**
- Les anciens "Bon de Commande" generes par `DemandeArticle` sont remplaces par "Fiche d'Expedition"
- Tous les documents incluent un bloc **Cachet et Signature**

---

## 2. Migration base de donnees

### Fichier : `migration.sql`

**IMPORTANT — A executer AVANT de lancer le serveur avec le nouveau code.**

```sql
-- 1. Sortie: add typeSortie column
ALTER TABLE `sortie`
  ADD COLUMN `typeSortie` VARCHAR(20) NOT NULL DEFAULT 'interne' AFTER `observation`;

-- 2. Sortie: add depotDestinataireId (FK to depot)
ALTER TABLE `sortie`
  ADD COLUMN `depotDestinataireId` INT NULL AFTER `chantierCode`;

ALTER TABLE `sortie`
  ADD CONSTRAINT `FK_sortie_depotDestinataire`
  FOREIGN KEY (`depotDestinataireId`) REFERENCES `depot`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Sortie: add external client destinataire fields
ALTER TABLE `sortie`
  ADD COLUMN `destinataireNom` VARCHAR(255) NULL AFTER `nomClient`,
  ADD COLUMN `destinataireAdresse` TEXT NULL AFTER `destinataireNom`,
  ADD COLUMN `destinataireMatriculeFiscal` VARCHAR(100) NULL AFTER `destinataireAdresse`;

-- 4. Depot: add adresse column
ALTER TABLE `depot`
  ADD COLUMN `adresse` VARCHAR(500) NULL AFTER `nom`;
```

### Comment executer la migration

#### Option A — Via MySQL client (recommande)

```bash
mysql -u root -p stock < migration.sql
```

#### Option B — Via un script Node.js (si mysql CLI non installe)

```bash
cd stock-backend
node -e "
const mysql = require('mysql2/promise');
const fs = require('fs');
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: '',
    database: process.env.DB_NAME || 'stock',
    port: Number(process.env.DB_PORT) || 3306,
    multipleStatements: true
  });
  const sql = fs.readFileSync('migration.sql', 'utf-8');
  await conn.query(sql);
  console.log('Migration executee avec succes');
  await conn.end();
})().catch(e => { console.error('Erreur migration:', e.message); process.exit(1); });
"
```

#### Option C — Via phpMyAdmin / DBeaver / DataGrip

1. Ouvrir la base `stock`
2. Copier-coller le contenu de `migration.sql`
3. Executer

### Verifier que la migration est appliquee

```bash
mysql -u root -p stock -e "DESCRIBE sortie;"
```

Vous devez voir les colonnes : `typeSortie`, `depotDestinataireId`, `destinataireNom`, `destinataireAdresse`, `destinataireMatriculeFiscal`.

```bash
mysql -u root -p stock -e "DESCRIBE depot;"
```

Vous devez voir la colonne `adresse`.

> **Note :** `synchronize: false` dans `data-source.ts` — TypeORM ne modifie PAS automatiquement le schema. La migration manuelle est obligatoire.

---

## 3. Fichiers modifies

### Entites (Entity)

| Fichier | Changement |
|---|---|
| `src/entity/Sortie.ts` | Ajout : `typeSortie`, `depotDestinataire` (relation ManyToOne → Depot), `destinataireNom`, `destinataireAdresse`, `destinataireMatriculeFiscal` |
| `src/entity/Depot.ts` | Ajout : `adresse` |
| `src/entity/Document.ts` | `DocumentType` inclut maintenant `"fiche_expedition"` |

### DTOs

| Fichier | Changement |
|---|---|
| `src/dto/sortie.dto.ts` | `CreateSortieDto` : ajout `typeSortie`, `depotDestinataireId`, `destinataireNom`, `destinataireAdresse`, `destinataireMatriculeFiscal` |
| `src/dto/depot.dto.ts` | `AjouterDepotDto` / `ModifierDepotDto` : ajout `adresse` |

### Validators (Joi)

| Fichier | Changement |
|---|---|
| `src/settings/validators/sortie.validator.ts` | Ajout des nouveaux champs dans `createSortieValidator` |
| `src/settings/validators/depot.validator.ts` | Ajout `adresse` dans create/update |

### Services (Logique metier)

| Fichier | Changement |
|---|---|
| `src/controller/sortie.service.ts` | `createSortie` : gestion des nouveaux champs. `confirmDenySortie` : generation conditionnelle (Fiche d'Expedition si interne, Bon de Livraison si externe) |
| `src/controller/demandeArticles.service.ts` | `confirmOrDeny` : remplace `generateBonDeCommandeForDemande` par `generateFicheExpeditionForDemande` |
| `src/controller/depot.service.ts` | `creerDepot` / `modifierDepot` : sauvegarde de `adresse` |

### PDF Generation

| Fichier | Changement |
|---|---|
| `src/utilities/pdf-template.util.ts` | 3 nouvelles fonctions de template HTML + `signatureHtml()` reutilisable |
| `src/utilities/pdf.util.ts` | 3 nouvelles fonctions : `generateFicheExpeditionForDemande`, `generateFicheExpeditionForSortie`, `generateBonDeLivraisonForSortie` |

### Error Handling

| Fichier | Changement |
|---|---|
| `src/settings/global-error-handler.ts` | Ajout `console.error` pour logger les erreurs 500 dans le terminal |

---

## 4. Les 3 types de documents generes

### 4.1 Fiche d'Expedition — DemandeArticle

- **Titre PDF :** "Fiche d'Expedition"
- **Declencheur :** Confirmation d'une `DemandeArticle`
- **Bloc Destinataire :** Nom et adresse du **chantier**
- **Bloc Shipping :** AUCUN (pas d'info transport)
- **Table articles :** Designation + Quantite seulement (PAS de prix, TVA, totaux)
- **Signature :** Oui (Cachet, Date et Signature)

### 4.2 Fiche d'Expedition — Sortie Interne

- **Titre PDF :** "Fiche d'Expedition"
- **Declencheur :** Confirmation d'une `Sortie` avec `typeSortie = "interne"`
- **Bloc Destinataire :** Nom et adresse du **chantier** OU du **depot destinataire**
- **Bloc Shipping :** Oui — Methode d'expedition, Transporteur, Matricule voiture
- **Table articles :** Designation, Poids/vol., Qte commandee, Qte a expedier
- **Signature :** Oui

### 4.3 Bon de Livraison — Sortie Externe

- **Titre PDF :** "Bon De Livraison"
- **Declencheur :** Confirmation d'une `Sortie` avec `typeSortie = "externe"`
- **Bloc Destinataire :** Nom de l'entreprise, adresse, **matricule fiscal**
- **Bloc Shipping :**
  - `typeLivraison = "chauffeur"` → Nos propres moyens + Transporteur + Matricule
  - `typeLivraison = "client"` + avec transporteur → Transporteur + Matricule
  - `typeLivraison = "client"` + sans transporteur → Nom du client
- **Table articles :** Designation, Poids/vol., Qte commandee, Qte a expedier
- **Signature :** Oui

---

## 5. Workflows & API Endpoints

### Workflow : Sortie Interne (vers Chantier)

```
POST /api/sorties/create
  → typeSortie: "interne", chantierId: X

PUT /api/sorties/confirm-deny
  → action: "confirm"
  → Genere: Fiche d'Expedition (destinataire = chantier)
```

### Workflow : Sortie Interne (vers Depot)

```
POST /api/sorties/create
  → typeSortie: "interne", depotDestinataireId: X

PUT /api/sorties/confirm-deny
  → action: "confirm"
  → Genere: Fiche d'Expedition (destinataire = depot)
```

### Workflow : Sortie Externe (client)

```
POST /api/sorties/create
  → typeSortie: "externe", destinataireNom, destinataireAdresse, destinataireMatriculeFiscal

PUT /api/sorties/confirm-deny
  → action: "confirm"
  → Genere: Bon de Livraison
```

### Workflow : DemandeArticle

```
POST /api/demandes-articles/create
  → chantierId: X, articles: [...]

PUT /api/demandes-articles/confirm-deny
  → action: "confirm"
  → Genere: Fiche d'Expedition (articles + qty seulement)
```

---

## 6. Exemples de payloads

### Sortie Interne vers Chantier

```json
{
  "articles": [{ "articleId": 1, "stockSortie": 3 }],
  "compteId": 1,
  "typeSortie": "interne",
  "chantierId": 1,
  "typeLivraison": "chauffeur",
  "nomChauffeur": "Faouzi JMOUR",
  "matriculeVoiture": "199 TUN 8861"
}
```

### Sortie Interne vers Depot

```json
{
  "articles": [{ "articleId": 1, "stockSortie": 5 }],
  "compteId": 1,
  "typeSortie": "interne",
  "depotDestinataireId": 2,
  "typeLivraison": "chauffeur",
  "nomChauffeur": "Ahmed BEN SALAH",
  "matriculeVoiture": "205 TUN 1234"
}
```

### Sortie Externe (client avec transport)

```json
{
  "articles": [{ "articleId": 1, "stockSortie": 10 }],
  "compteId": 1,
  "typeSortie": "externe",
  "typeLivraison": "client",
  "nomChauffeur": "Transporteur ABC",
  "matriculeVoiture": "180 TUN 5500",
  "destinataireNom": "Societe XYZ",
  "destinataireAdresse": "Zone Industrielle, Ben Arous",
  "destinataireMatriculeFiscal": "1234567/A/M/000"
}
```

### Sortie Externe (client sans transport)

```json
{
  "articles": [{ "articleId": 1, "stockSortie": 2 }],
  "compteId": 1,
  "typeSortie": "externe",
  "typeLivraison": "client",
  "nomClient": "Mohamed TRABELSI",
  "destinataireNom": "Societe ABC",
  "destinataireAdresse": "Rue de Marseille, Tunis",
  "destinataireMatriculeFiscal": "9876543/B/P/000"
}
```

### Confirmer une Sortie

```json
{
  "sortieId": 1,
  "action": "confirm"
}
```

---

## 7. Instructions pour les developpeurs

### Etape 1 — Pull le dernier code

```bash
git pull origin main
```

### Etape 2 — Executer la migration SQL

**C'est obligatoire.** Sans cette etape, le serveur demarre mais les requetes `Sortie` echouent.

```bash
# Via MySQL client
mysql -u root -p stock < migration.sql

# OU via Node.js (voir Option B ci-dessus)
```

### Etape 3 — Installer les dependances (si nouvelles)

```bash
cd stock-backend
npm install
```

### Etape 4 — Lancer le serveur

```bash
npm run dev
```

### Verification rapide

Le serveur doit afficher :
```
Server started on http://0.0.0.0:4000
```

Sans aucune erreur TypeScript.

---

### Points d'attention pour eviter les conflits

| Regle | Pourquoi |
|---|---|
| **Toujours executer `migration.sql` apres un pull** | `synchronize: false` — TypeORM ne touche pas au schema |
| **Ne pas modifier `DocumentType` sans prevenir l'equipe** | Ce type est utilise par entree, sortie, demande et retour |
| **Les colonnes de `Sortie` ont des defaults** | `typeSortie` default `"interne"`, `typeLivraison` default `"chauffeur"` — les sorties existantes ne sont pas impactees |
| **Le `depotDestinataireId` est nullable** | Pas de migration de donnees necessaire pour les anciennes sorties |
| **Ne pas supprimer `bande_commande` de `DocumentType`** | C'est toujours utilise par `entree.service.ts` pour les documents uploades |
| **Puppeteer doit etre installe** | La generation PDF utilise Puppeteer en mode headless |

---

### Schema des nouvelles colonnes

```
sortie
├── typeSortie           VARCHAR(20)  NOT NULL DEFAULT 'interne'
├── depotDestinataireId  INT          NULL     FK → depot(id)
├── destinataireNom      VARCHAR(255) NULL
├── destinataireAdresse  TEXT         NULL
└── destinataireMatriculeFiscal VARCHAR(100) NULL

depot
└── adresse              VARCHAR(500) NULL
```

---

### Postman Collection

Un fichier `postman-collection.json` est fourni a la racine du projet pour tester tous les workflows. Importez-le dans Postman et configurez les variables de collection avant de lancer les requetes.
