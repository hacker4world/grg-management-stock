# Stock Backend API Documentation

## Overview

This is a **Stock Management System Backend** built with:
- **Express.js** - Web framework
- **TypeORM** - ORM for MySQL database
- **JWT** - Authentication via cookies
- **Joi** - Request validation
- **Bcrypt** - Password hashing

The API manages:
- 📦 **Articles** (inventory items)
- 🏗️ **Chantiers** (construction sites)
- 📋 **Demandes d'articles** (article requests from sites)
- 🔄 **Retours** (returns from sites)
- 👤 **User accounts & authentication**
- 📂 **Classification system** (Famille → Sous-Famille → Catégorie)
- 🏭 **Suppliers & Manufacturers**

---

## Base URL

```
http://localhost:{SERVER_PORT}/api
```

---

## Data Models

### User Account (Compte)
| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| nom | string | Last name |
| prenom | string | First name |
| nom_utilisateur | string | Username (unique) |
| motdepasse | string | Hashed password |
| confirme | boolean | Account approved status |
| role | string | User role (default: "merchant") |

### Chantier (Construction Site)
| Field | Type | Description |
|-------|------|-------------|
| code | number | Primary key |
| nom | string | Site name |
| adresse | string | Address |
| compte | Compte | Associated user account |

### Article
| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| nom | string | Article name |
| stockMinimum | number | Minimum stock level |
| stockActuel | number | Current stock level |
| prixMoyenne | number | Average price |
| depot | Depot | Storage location |
| unite | Unite | Unit of measure |
| categorie | Categorie | Category |

### Demande Article (Article Request)
| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| date | date | Request date |
| status | string | "pending" / "confirmed" / "denied" |
| chantier | Chantier | Requesting site |
| items | DemandeArticleItem[] | Requested items |

### Retour Article (Article Return)
| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key |
| date | date | Return date |
| status | string | "pending" / "confirmed" / "denied" |
| chantier | Chantier | Returning site |
| items | RetourArticleItem[] | Returned items with reasons |

### Classification Hierarchy
```
Famille (Family)
  └── SousFamille (Sub-family)
        └── Categorie (Category)
              └── Article
```

---

## API Endpoints

### 🔐 Authentication (`/api/authentification`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new account |
| POST | `/login` | Login and get JWT cookie |
| POST | `/logout` | Clear JWT cookie |
| GET | `/verify` | Verify current session |
| GET | `/liste` | List confirmed accounts |
| GET | `/requettes` | List pending accounts |
| POST | `/accepter-compte` | Approve a pending account |
| PUT | `/modifier` | Update account |
| DELETE | `/supprimer` | Delete account |

#### POST `/signup`
```json
{
  "nom": "Doe",
  "prenom": "John",
  "nom_utilisateur": "johndoe",
  "motdepasse": "password123"
}
```

#### POST `/login`
```json
{
  "nom_utilisateur": "johndoe",
  "motdepasse": "password123"
}
```
**Response:** Sets `token` cookie + returns user info

---

### 🏗️ Chantiers (`/api/chantier`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/liste` | List all sites |
| POST | `/ajouter` | Create new site |
| PUT | `/modifier` | Update site |
| DELETE | `/supprimer` | Delete site |

#### POST `/ajouter`
```json
{
  "nom": "Site Paris Nord",
  "adresse": "123 Rue Example, Paris",
  "compteId": 1
}
```

#### PUT `/modifier`
```json
{
  "code_chantier": 1,
  "nom": "Site Paris Sud",
  "adresse": "456 Avenue Test, Paris",
  "compteId": 2
}
```

---

### 📦 Articles (`/api/articles`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/liste` | List all articles |
| POST | `/creer` | Create new article |
| PUT | `/modifier` | Update article |
| DELETE | `/supprimer` | Delete article |

#### POST `/creer`
```json
{
  "nom": "Ciment Portland",
  "stockMin": 100,
  "depotId": 1,
  "categorieId": 1,
  "uniteId": 1
}
```

---

### 📋 Demandes d'Articles (`/api/demandes-articles`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/liste` | List requests with filters |
| POST | `/ajouter` | Create new request |
| POST | `/traiter` | Confirm or deny request |

#### POST `/ajouter`
```json
{
  "chantierId": 1,
  "items": [
    { "articleId": 1, "quantity": 50 },
    { "articleId": 2, "quantity": 25 }
  ]
}
```

#### POST `/traiter`
**Auth:** Bearer token (magasinier ou admin).

```json
{
  "demandeId": 1,
  "action": "confirm"  // or "deny"
}
```
**Response (confirm):** Décrémente le stock, génère les PDFs bande commande et bande livraison, retourne les URLs de téléchargement :
```json
{
  "message": "Demande confirmée",
  "demande": { ... },
  "documents": [
    { "id": 1, "type": "bande_commande", "downloadUrl": "/api/documents/1/download" },
    { "id": 2, "type": "bande_livraison", "downloadUrl": "/api/documents/2/download" }
  ]
}
```

#### GET `/liste` Query Params
- `chantierId` - Filter by site
- `articleId` - Filter by article
- `date` - Filter by date (YYYY-MM-DD)
- `page` - Pagination

---

### 📥 Entrée Stock (`/api/entree`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/liste` | List stock entries (with filters) |
| POST | `/ajouter` | Create stock entry + upload documents (magasinier) |
| PUT | `/traiter` | Confirm or refuse entry |

#### POST `/ajouter`
**Auth:** Bearer token (magasinier ou admin).  
**Content-Type:** `multipart/form-data`.

**Fields:**
- `articleId` (number)
- `fournisseurId` (number)
- `fabriquantId` (number)
- `stockEntree` (number)
- `prix` (number)
- `observation` (string, optional)
- `bande_commande` (file, required) – PDF or image
- `bande_livraison` (file, required) – PDF or image

**Response:** `{ message, entree, documents }`

---

### 📄 Documents (`/api/documents`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:id/download` | Download document (auth + permissions) |

#### GET `/:id/download`
**Auth:** Bearer token.  
**Permissions:** Admin / magasinier : tous les documents. Responsable chantier : documents des demandes de ses chantiers uniquement.

**Response:** File stream (PDF/image) with `Content-Disposition: attachment`.

---

### 🔄 Retours (`/api/retours`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/liste` | List returns with filters |
| POST | `/ajouter` | Create new return |
| PUT | `/traiter` | Approve or deny return |

#### POST `/ajouter`
```json
{
  "chantierId": 1,
  "items": [
    { "articleId": 1, "quantite": 10, "reason": "Surplus de matériel" },
    { "articleId": 2, "quantite": 5, "reason": "Produit défectueux" }
  ]
}
```

#### PUT `/traiter`
```json
{
  "retourId": 1,
  "action": "approve"  // or "deny"
}
```

---

### 🏢 Dépôts (`/api/depots`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/liste` | List all depots |
| POST | `/ajouter` | Create depot |
| PUT | `/modifier` | Update depot |
| DELETE | `/supprimer` | Delete depot |

#### POST `/ajouter`
```json
{ "nom": "Dépôt Principal" }
```

---

### 📏 Unités (`/api/unites`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/liste` | List all units |
| POST | `/creer` | Create unit |
| PUT | `/modifier` | Update unit |
| DELETE | `/supprimer` | Delete unit |

#### POST `/creer`
```json
{ "nom": "Kilogramme" }
```

---

### 📂 Classification

#### Familles (`/api/classement/familles`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/liste` | List families (paginated) |
| GET | `/tous` | List all families |
| GET | `/recherche` | Search families |
| POST | `/creer` | Create family |
| PUT | `/modifier` | Update family |
| DELETE | `/supprimer` | Delete family |

#### Sous-Familles (`/api/classement/sous-famille`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/liste` | List sub-families |
| GET | `/filtrer` | Filter sub-families |
| POST | `/creer` | Create sub-family |
| PUT | `/modifier` | Update sub-family |
| DELETE | `/supprimer` | Delete sub-family |

#### Catégories (`/api/classement/categorie`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/liste` | List categories |
| PUT | `/modifier` | Update category |
| DELETE | `/supprimer` | Delete category |

---

### 🏭 Fournisseurs (`/api/fournisseurs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/liste` | List suppliers |
| POST | `/ajouter` | Create supplier |
| PUT | `/modifier` | Update supplier |
| DELETE | `/supprimer` | Delete supplier |

#### POST `/ajouter`
```json
{
  "nom": "Fournisseur ABC",
  "contact": "+33 1 23 45 67 89",
  "adresse": "123 Rue Commerce, Lyon"
}
```

---

### 🏭 Fabriquants (`/api/fabriquants`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/liste` | List manufacturers |
| POST | `/ajouter` | Create manufacturer |
| PUT | `/modifier` | Update manufacturer |
| DELETE | `/supprimer` | Delete manufacturer |

---

## Environment Variables

Create a `.env` file in the root:

```env
# Server
SERVER_PORT=3000

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_NAME=stock_db

# JWT
JWT_SECRET=your_jwt_secret_key

# Pagination
MAX_PER_PAGE=20
```

---

## Running the Project

### Prerequisites
- Node.js (v16+)
- MySQL Server
- npm or yarn

### Steps

1. **Install dependencies:**
   ```bash
   cd stock-backend
   npm install
   ```

2. **Set up MySQL database:**
   ```sql
   CREATE DATABASE stock_db;
   ```

3. **Configure environment:**
   Create `.env` file with your database credentials.

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Access Swagger docs:**
   ```
   http://localhost:3000/api-docs
   ```

---

## Tests manuels (Postman)

### 1. Entrée stock avec upload
1. **Login** : `POST /api/authentification/login` avec un compte **magasinier** (ou admin).
2. **Entrée stock** : `POST /api/entree/ajouter`
   - Type : **form-data**
   - Champs : `articleId`, `fournisseurId`, `fabriquantId`, `stockEntree`, `prix`, `observation` (optionnel)
   - Fichiers : `bande_commande` (file), `bande_livraison` (file) – PDF ou image
   - Header : `Authorization: Bearer <token>` (ou cookie)
3. Vérifier la réponse : `entree` + `documents` avec les 2 documents créés.

### 2. Confirmation demande et génération PDF
1. **Créer une demande** : `POST /api/demandes-articles/ajouter` (chantierId, items).
2. **Confirmer** : `POST /api/demandes-articles/traiter` avec `{ demandeId, action: "confirm" }` et token **magasinier** ou **admin**.
3. Vérifier la réponse : `documents` avec `bande_commande` et `bande_livraison` et leurs `downloadUrl`.

### 3. Téléchargement document
1. **Download** : `GET /api/documents/:id/download` avec header `Authorization: Bearer <token>`.
2. Utiliser un `id` retourné par l’entrée stock ou la confirmation de demande.
3. Vérifier que le fichier est bien streamé (PDF ou image).

---

## Features for Mobile Integration (chantier-app)

The most relevant endpoints for the mobile app are:

### For Workers/Merchants:
- `POST /api/authentification/signup` - Register
- `POST /api/authentification/login` - Login
- `GET /api/chantier/liste` - View assigned sites
- `GET /api/articles/liste` - Browse available articles
- `POST /api/demandes-articles/ajouter` - Request articles
- `POST /api/retours/ajouter` - Return articles
- `GET /api/demandes-articles/liste` - View request history
- `GET /api/retours/liste` - View return history

### For Admins:
- `GET /api/authentification/requettes` - Pending account approvals
- `POST /api/authentification/accepter-compte` - Approve accounts
- `POST /api/demandes-articles/traiter` - Process requests
- `PUT /api/retours/traiter` - Process returns

---

## Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### List Response (Paginated)
```json
{
  "items": [...],
  "count": 10,
  "totalPages": 5,
  "lastPage": false
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

---

## Security Features

- **Rate Limiting** - Prevents abuse
- **Helmet** - HTTP security headers
- **CORS** - Cross-origin configuration
- **JWT Cookies** - Secure, HTTP-only cookies
- **Password Hashing** - Bcrypt with salt rounds
- **Input Validation** - Joi schemas
