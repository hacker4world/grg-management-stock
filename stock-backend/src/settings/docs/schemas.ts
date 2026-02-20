/* eslint-disable */
/**
 * @openapi
 * components:
 *   schemas:
 *     Unite:
 *       type: object
 *       properties:
 *         id: {type: integer}
 *         nom: {type: string}
 *     AjouterUniteDto:
 *       type: object
 *       properties:
 *         nom: {type: string, minLength: 1}
 *       required: [nom]
 *     ModifierUniteDto:
 *       type: object
 *       properties:
 *         id: {type: integer}
 *         nom: {type: string, minLength: 1}
 *       required: [id, nom]
 *     Famille:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         nom: { type: string }
 *
 *     CreerFamilleDto:
 *       type: object
 *       properties:
 *         nom: { type: string, minLength: 1 }
 *       required: [nom]
 *
 *     ModifierFamilleDto:
 *       type: object
 *       properties:
 *         famille_id: { type: integer }
 *         nom: { type: string, minLength: 1 }
 *       required: [famille_id, nom]
 *
 *     SupprimerFamilleDto:
 *       type: object
 *       properties:
 *         famille_id: { type: integer }
 *       required: [famille_id]
 *
 *     SousFamille:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         nom: { type: string }
 *         famille: { $ref: '#/components/schemas/Famille' }
 *
 *     CreerSousFamilleDto:
 *       type: object
 *       properties:
 *         nom: { type: string, minLength: 1 }
 *         famille_id: { type: integer }
 *       required: [nom, famille_id]
 *
 *     ModifierSousFamilleDto:
 *       type: object
 *       properties:
 *         sous_famille_id: { type: integer }
 *         nom: { type: string, minLength: 1 }
 *         famille_id: { type: integer }
 *       required: [sous_famille_id, nom, famille_id]
 *
 *     Categorie:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         nom: { type: string }
 *
 *     CreerCategorieDto:
 *       type: object
 *       properties:
 *         nom: { type: string, minLength: 1 }
 *       required: [nom]
 *
 *     ModifierCategorieDto:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         nom: { type: string, minLength: 1 }
 *       required: [id, nom]
 */
export {}; // keep as module
