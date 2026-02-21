# Guide : Type de Livraison & Transporteur

## Nouveaux champs sur la Sortie

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `typeLivraison` | `"chauffeur"` \| `"client"` | Non (défaut: `"chauffeur"`) | Méthode d'expédition |
| `nomChauffeur` | `string` | Non | Nom du transporteur (chauffeur entreprise ou transporteur du client) |
| `matriculeVoiture` | `string` | Non | Matricule du véhicule |
| `nomClient` | `string` | Non | Nom + prénom du client (quand il vient seul) |

---

## Les 3 scénarios de livraison

### Scénario 1 : Chauffeur (Nos propres moyens)

L'entreprise envoie son propre chauffeur pour livrer la commande.

**Request body :**

```json
POST /api/sorties/create
{
  "compteId": 1,
  "chantierId": 1,
  "typeLivraison": "chauffeur",
  "nomChauffeur": "Faouzi JMOUR",
  "matriculeVoiture": "199 TUN 8861",
  "articles": [
    { "articleId": 5, "stockSortie": 10 }
  ]
}
```

**Résultat sur le BL :**

```
Méthode d'expédition : Nos propres moyens
Transporteur : Faouzi JMOUR
Matricule voiture : 199 TUN 8861
```

---

### Scénario 2 : Client seul (vient en personne)

Le client vient lui-même chercher la commande. Pas de transporteur.

**Request body :**

```json
POST /api/sorties/create
{
  "compteId": 1,
  "chantierId": 1,
  "typeLivraison": "client",
  "nomClient": "Mohamed Trabelsi",
  "articles": [
    { "articleId": 5, "stockSortie": 3 }
  ]
}
```

**Résultat sur le BL :**

```
Méthode d'expédition : Client
Nom du client : Mohamed Trabelsi
```

> Si `nomClient` n'est pas fourni, le nom du chantier (destinataire) sera utilisé par défaut.

---

### Scénario 3 : Client + son transporteur

Le client envoie son propre transporteur pour récupérer la commande.

**Request body :**

```json
POST /api/sorties/create
{
  "compteId": 1,
  "chantierId": 1,
  "typeLivraison": "client",
  "nomChauffeur": "Ahmed Ben Salem",
  "matriculeVoiture": "220 TUN 5543",
  "articles": [
    { "articleId": 5, "stockSortie": 5 }
  ]
}
```

**Résultat sur le BL :**

```
Méthode d'expédition : Client
Transporteur : Ahmed Ben Salem
Matricule voiture : 220 TUN 5543
```

---

## Logique de décision

```
typeLivraison = "chauffeur"
  → Méthode : Nos propres moyens
  → Affiche : nomChauffeur + matriculeVoiture

typeLivraison = "client" ET nomChauffeur renseigné
  → Méthode : Client
  → Affiche : nomChauffeur + matriculeVoiture (transporteur du client)

typeLivraison = "client" ET nomChauffeur vide
  → Méthode : Client
  → Affiche : nomClient (ou nom du chantier par défaut)
```

---

## Fichiers concernés

| Fichier | Modification |
|---------|-------------|
| `src/entity/Sortie.ts` | Colonnes : `typeLivraison`, `nomChauffeur`, `matriculeVoiture`, `nomClient` |
| `src/dto/sortie.dto.ts` | Champs ajoutés au DTO de création |
| `src/settings/validators/sortie.validator.ts` | Validation Joi des nouveaux champs |
| `src/controller/sortie.service.ts` | Sauvegarde des nouveaux champs lors de la création |
| `src/utilities/pdf-template.util.ts` | Section expédition dynamique dans le template BL |

## Base de données

Les colonnes suivantes ont été ajoutées à la table `sortie` :

```sql
ALTER TABLE sortie ADD COLUMN typeLivraison VARCHAR(20) NOT NULL DEFAULT 'chauffeur';
ALTER TABLE sortie ADD COLUMN nomChauffeur VARCHAR(255) NULL;
ALTER TABLE sortie ADD COLUMN matriculeVoiture VARCHAR(100) NULL;
ALTER TABLE sortie ADD COLUMN nomClient VARCHAR(255) NULL;
```
