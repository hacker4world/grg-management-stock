-- ============================================================
-- Migration: Refactor Sortie schema for 3-type model
--   interne_depot | interne_chantier | externe
-- Date: 2026-02-15
-- ============================================================
-- Run this ONLY if migrating from the old schema (typeSortie = "interne" | "externe").
-- If starting fresh with synchronize: true, this is not needed.
-- ============================================================

-- ============================================================
-- STEP 1: Modify typeSortie column (wider + no default)
-- ============================================================
ALTER TABLE `sortie`
  MODIFY COLUMN `typeSortie` VARCHAR(30) NOT NULL;

-- Migrate old "interne" values:
--   If the sortie had a chantierCode -> interne_chantier
--   If the sortie had a depotDestinataireId (or depotId) -> interne_depot
--   Otherwise default to interne_chantier
UPDATE `sortie`
  SET `typeSortie` = 'interne_chantier'
  WHERE `typeSortie` = 'interne' AND `chantierCode` IS NOT NULL;

UPDATE `sortie`
  SET `typeSortie` = 'interne_depot'
  WHERE `typeSortie` = 'interne' AND `chantierCode` IS NULL;

-- ============================================================
-- STEP 2: Rename depotDestinataireId -> depotId (if old column exists)
-- ============================================================
-- If coming from the old schema that had depotDestinataireId:
ALTER TABLE `sortie`
  DROP FOREIGN KEY IF EXISTS `FK_sortie_depotDestinataire`;

ALTER TABLE `sortie`
  CHANGE COLUMN IF EXISTS `depotDestinataireId` `depotId` INT NULL;

ALTER TABLE `sortie`
  ADD CONSTRAINT `FK_sortie_depot`
  FOREIGN KEY (`depotId`) REFERENCES `depot`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- STEP 3: Add new transport fields per type
-- ============================================================
-- Interne Depot transport
ALTER TABLE `sortie`
  ADD COLUMN IF NOT EXISTS `nomTransporteurDepot` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `matriculeTransporteurDepot` VARCHAR(100) NULL;

-- Interne Chantier transport
ALTER TABLE `sortie`
  ADD COLUMN IF NOT EXISTS `nomTransporteurChantier` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `matriculeTransporteurChantier` VARCHAR(100) NULL;

-- Externe sub-type
ALTER TABLE `sortie`
  ADD COLUMN IF NOT EXISTS `sousTypeSortieExterne` VARCHAR(30) NULL;

-- Externe enterprise info (renamed from old destinataire* fields)
ALTER TABLE `sortie`
  ADD COLUMN IF NOT EXISTS `nomEntreprise` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `adresseEntreprise` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `matriculeFiscalEntreprise` VARCHAR(100) NULL;

-- Externe transport
ALTER TABLE `sortie`
  ADD COLUMN IF NOT EXISTS `nomTransporteurExterne` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `matriculeTransporteurExterne` VARCHAR(100) NULL;

-- ============================================================
-- STEP 4: Migrate old external destinataire fields to new names
-- ============================================================
UPDATE `sortie`
  SET `nomEntreprise` = `destinataireNom`,
      `adresseEntreprise` = `destinataireAdresse`,
      `matriculeFiscalEntreprise` = `destinataireMatriculeFiscal`
  WHERE `typeSortie` = 'externe'
    AND `destinataireNom` IS NOT NULL;

-- Migrate old transport fields
UPDATE `sortie`
  SET `nomTransporteurChantier` = `nomChauffeur`,
      `matriculeTransporteurChantier` = `matriculeVoiture`
  WHERE `typeSortie` = 'interne_chantier'
    AND `nomChauffeur` IS NOT NULL;

UPDATE `sortie`
  SET `nomTransporteurDepot` = `nomChauffeur`,
      `matriculeTransporteurDepot` = `matriculeVoiture`
  WHERE `typeSortie` = 'interne_depot'
    AND `nomChauffeur` IS NOT NULL;

-- For externe sorties, set sousTypeSortieExterne based on old typeLivraison
UPDATE `sortie`
  SET `sousTypeSortieExterne` = 'avec_transporteur',
      `nomTransporteurExterne` = `nomChauffeur`,
      `matriculeTransporteurExterne` = `matriculeVoiture`
  WHERE `typeSortie` = 'externe'
    AND `typeLivraison` = 'chauffeur';

UPDATE `sortie`
  SET `sousTypeSortieExterne` = 'sans_transporteur'
  WHERE `typeSortie` = 'externe'
    AND (`typeLivraison` = 'client' OR `typeLivraison` IS NULL);

-- ============================================================
-- STEP 5: Drop old columns (ONLY after verifying migration above)
-- ============================================================
ALTER TABLE `sortie`
  DROP COLUMN IF EXISTS `typeLivraison`,
  DROP COLUMN IF EXISTS `nomChauffeur`,
  DROP COLUMN IF EXISTS `matriculeVoiture`,
  DROP COLUMN IF EXISTS `destinataireNom`,
  DROP COLUMN IF EXISTS `destinataireAdresse`,
  DROP COLUMN IF EXISTS `destinataireMatriculeFiscal`;

-- ============================================================
-- STEP 6: Depot adresse (if not already added)
-- ============================================================
ALTER TABLE `depot`
  ADD COLUMN IF NOT EXISTS `adresse` VARCHAR(500) NULL AFTER `nom`;
