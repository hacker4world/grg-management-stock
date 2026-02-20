-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 13, 2025 at 01:36 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `stock`
--

-- --------------------------------------------------------

--
-- Table structure for table `article`
--

CREATE TABLE `article` (
  `code` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prix` int(11) NOT NULL,
  `stock` int(11) NOT NULL,
  `stockMin` int(11) NOT NULL,
  `stockMax` int(11) NOT NULL,
  `categorieId` int(11) DEFAULT NULL,
  `fabriquantCode` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `article`
--

INSERT INTO `article` (`code`, `nom`, `prix`, `stock`, `stockMin`, `stockMax`, `categorieId`, `fabriquantCode`) VALUES
('ART-001', 'Ciment CPJ 32.5 35kg', 7, 450, 50, 500, 3, 'LMB-75016'),
('ART-002', 'Laine de Verre R=4 100mm', 13, 280, 30, 300, 27, 'ISOC-31000'),
('ART-003', 'Plaque de Plâtre BA13', 9, 600, 100, 800, 51, 'KNF-67000'),
('ART-004', 'Mortier de Jointoiement Gris 25kg', 9, 320, 40, 350, 8, 'WEB-92300'),
('ART-005', 'Colle Carrelage C2 Flex 20kg', 15, 180, 20, 200, 10, 'BOS-69008'),
('ART-006', 'Béton Fondation 35MPa m3', 125, 25, 5, 30, 12, 'LMB-75016'),
('ART-007', 'Gravier 6/10 Big Bag 1t', 85, 45, 10, 50, 13, 'TER-59000'),
('ART-008', 'Acier Laminé FeE500 6m', 23, 120, 15, 150, 17, 'SGP-92100'),
('ART-009', 'Bois Sapin Traité 100x100mm', 19, 350, 50, 400, 22, 'PARE-33000'),
('ART-010', 'Polystyrène Expansé 100mm', 15, 420, 60, 500, 27, 'SIK-69100'),
('ART-011', 'Laine de Roche Acoustique', 16, 190, 25, 250, 28, 'ISOC-31000'),
('ART-012', 'Porte Blanche 204x82cm', 89, 75, 10, 100, 32, 'PLK-44800'),
('ART-013', 'Fenêtre PVC 120x120cm', 245, 35, 5, 40, 34, 'KNF-67000'),
('ART-014', 'Câble H07V-U 2.5mm² 100m', 66, 85, 10, 100, 37, 'SGP-92100'),
('ART-015', 'Interrupteur Va-et-Vient Blanc', 5, 520, 50, 600, 38, 'WEB-92300'),
('ART-016', 'Spot LED 10W IP44', 12, 380, 40, 450, 39, 'BOS-69008'),
('ART-017', 'Tuyau PVC Ø100mm 2m', 19, 210, 25, 250, 42, 'SIK-69100'),
('ART-018', 'Robinet Lavabo Chromé', 25, 150, 20, 180, 43, 'WEB-92300'),
('ART-019', 'Évier Inox 1.5 Bac', 129, 60, 8, 80, 44, 'SGP-92100'),
('ART-020', 'Carrelage Sol 30x60cm Gris', 22, 890, 100, 1000, 47, 'PARE-33000'),
('ART-021', 'Parquet Massif Chêne 14mm', 46, 280, 30, 350, 48, 'TER-59000'),
('ART-022', 'Peinture Acrylique Blanche 10L', 40, 320, 40, 400, 49, 'BOS-69008'),
('ART-023', 'Papier Intissé Uni 10m', 19, 540, 60, 600, 50, 'PLK-44800'),
('ART-024', 'Marteau Arrache-Clou 500g', 16, 180, 20, 200, 52, 'WEB-92300'),
('ART-025', 'Perceuse Visseuse 18V', 89, 95, 12, 120, 53, 'BOS-69008'),
('ART-026', 'Mètre Ruban 8m', 8, 420, 50, 500, 54, 'SGP-92100'),
('ART-027', 'Casque de Sécurité Jaune', 9, 310, 35, 350, 55, 'SIK-69100'),
('ART-028', 'Échafaudage Roulant 2x1m', 450, 18, 3, 25, 56, 'KNF-67000'),
('ART-029', 'Béton de Propreté 20MPa', 110, 32, 5, 40, 57, 'LMB-75016'),
('ART-030', 'Tuyau Drainant Ø80mm', 13, 280, 30, 300, 58, 'SIK-69100'),
('ART-031', 'Géotextile Non Tissé 100g', 4, 650, 80, 700, 59, 'TER-59000'),
('ART-032', 'Membrane Bitume 4x1m', 29, 120, 15, 150, 60, 'SIK-69100'),
('ART-033', 'Terre Végétale Big Bag', 75, 55, 8, 70, 61, 'TER-59000'),
('ART-034', 'Ciment CPJ 42.5 35kg', 7, 380, 45, 450, 4, 'LMB-75016'),
('ART-035', 'Enduit de Lissage 25kg', 12, 290, 35, 350, 9, 'WEB-92300'),
('ART-036', 'Chape Fluide 30kg', 17, 160, 20, 200, 11, 'BOS-69008'),
('ART-037', 'Gravillon 4/6 25kg', 5, 780, 100, 900, 15, 'TER-59000'),
('ART-038', 'Poutre IPN 100mm 6m', 145, 28, 4, 35, 18, 'SGP-92100'),
('ART-039', 'Tôle Galvanisée 2x1m', 43, 85, 12, 100, 19, 'KNF-67000'),
('ART-040', 'Tige Filetée M10 1m', 4, 620, 80, 700, 20, 'SGP-92100'),
('ART-041', 'Treillis Soudé 2.4x6m', 49, 65, 8, 80, 21, 'LMB-75016'),
('ART-042', 'Bois Chêne Massif 200x50mm', 33, 180, 25, 220, 23, 'PARE-33000'),
('ART-043', 'Panneau Aggloméré 250x125cm', 19, 420, 50, 500, 24, 'PLK-44800'),
('ART-044', 'Contreplaqué CTBX 15mm', 30, 310, 40, 400, 25, 'KNF-67000'),
('ART-045', 'Lambris Pin 100x15mm', 9, 580, 70, 650, 26, 'PARE-33000'),
('ART-046', 'Panneau Polyuréthane 50mm', 23, 240, 30, 300, 27, 'SIK-69100'),
('ART-047', 'Mousse Acoustique 50x50cm', 15, 190, 25, 250, 28, 'ISOC-31000'),
('ART-048', 'Laine de Bois 100mm', 20, 160, 20, 200, 29, 'TER-59000'),
('ART-049', 'Panneau Solaire 300W', 285, 42, 6, 50, 30, 'WEB-92300'),
('ART-050', 'VMC Simple Flux', 125, 38, 5, 45, 31, 'KNF-67000'),
('ART-051', 'Porte Placard Coulissante', 145, 52, 8, 65, 33, 'PLK-44800'),
('ART-052', 'Baie Coulissante Alu 2m', 420, 22, 3, 30, 35, 'KNF-67000'),
('ART-053', 'Volet Roulant 140x120cm', 189, 45, 6, 55, 36, 'WEB-92300'),
('ART-054', 'Escalier Droit 13 marches', 650, 15, 2, 20, 37, 'PARE-33000'),
('ART-055', 'Fils R2V 1.5mm² 100m', 46, 95, 12, 120, 38, 'SGP-92100'),
('ART-056', 'Prise 16A 2P+T Blanc', 3, 680, 80, 750, 39, 'BOS-69008'),
('ART-057', 'Plafonnier LED 30W', 25, 180, 25, 220, 40, 'WEB-92300'),
('ART-058', 'Projecteur Extérieur 50W', 39, 120, 15, 150, 41, 'BOS-69008'),
('ART-059', 'Tableau Divisionnaire 12V', 89, 65, 8, 80, 42, 'SGP-92100'),
('ART-060', 'Raccord Laiton 20mm', 3, 850, 100, 1000, 43, 'WEB-92300'),
('ART-061', 'Mitigeur Évier Chromé', 46, 95, 12, 120, 44, 'SGP-92100'),
('ART-062', 'Lavabo Céramique Blanc', 89, 75, 10, 90, 45, 'PLK-44800'),
('ART-063', 'WC Suspendu avec Abattant', 245, 38, 5, 45, 46, 'KNF-67000'),
('ART-064', 'Siphon Lavabo Inox', 13, 210, 25, 250, 47, 'SIK-69100'),
('ART-065', 'Faïence Murale 15x15cm', 19, 520, 60, 600, 48, 'PARE-33000'),
('ART-066', 'Stratifié Bois Chêne 8mm', 22, 380, 45, 450, 49, 'TER-59000'),
('ART-067', 'Vernis Bois Satin 2.5L', 29, 190, 25, 240, 50, 'BOS-69008'),
('ART-068', 'Papier Vinylique Fleuri', 23, 280, 35, 350, 51, 'PLK-44800'),
('ART-069', 'Grille Technique 60x60cm', 19, 160, 20, 200, 52, 'KNF-67000'),
('ART-070', 'Tournevis Cruciforme PH2', 5, 420, 50, 500, 53, 'WEB-92300'),
('ART-071', 'Meuleuse 125mm 1200W', 79, 85, 12, 100, 54, 'BOS-69008'),
('ART-072', 'Niveau Laser 360°', 145, 42, 6, 50, 55, 'SGP-92100'),
('ART-073', 'Gants de Protection Paire', 7, 320, 40, 400, 56, 'SIK-69100'),
('ART-074', 'Échelle Coulissante 3x7m', 189, 28, 4, 35, 57, 'KNF-67000'),
('ART-075', 'Semelle Filante 40cm', 33, 180, 25, 220, 58, 'LMB-75016'),
('ART-076', 'Buse Béton Ø300mm', 46, 65, 8, 80, 59, 'TER-59000'),
('ART-077', 'Géotextile Tissé 200g', 6, 420, 50, 500, 60, 'SIK-69100'),
('ART-078', 'Feutre Asphalté 1x10m', 19, 190, 25, 240, 61, 'SIK-69100'),
('ART-079', 'Cailloux Concassés 20/40', 13, 320, 40, 400, 62, 'TER-59000'),
('ART-080', 'Mortier Prêt à l\'Emploi', 11, 280, 35, 350, 8, 'WEB-92300'),
('ART-081', 'Crépi Facade Blanc 25kg', 17, 190, 25, 240, 9, 'BOS-69008'),
('ART-082', 'Colle C1 Standard 20kg', 13, 240, 30, 300, 10, 'BOS-69008'),
('ART-083', 'Ragréage Autolissant 25kg', 25, 120, 15, 150, 11, 'WEB-92300'),
('ART-084', 'Béton Dalles 25MPa', 135, 22, 3, 30, 12, 'LMB-75016'),
('ART-085', 'Sable 0/2 35kg', 4, 950, 120, 1100, 14, 'TER-59000'),
('ART-086', 'Poutrelle Béton 20cm', 89, 45, 6, 55, 15, 'LMB-75016'),
('ART-087', 'Plastifiant Béton 5L', 19, 180, 25, 220, 16, 'SIK-69100'),
('ART-088', 'Acier Galvanisé 40x40mm', 29, 150, 20, 180, 17, 'SGP-92100'),
('ART-089', 'Cornière Métallique 50x50mm', 16, 280, 35, 350, 18, 'KNF-67000'),
('ART-090', 'Grillage Soudé 25x25mm', 9, 420, 50, 500, 19, 'SGP-92100'),
('ART-091', 'Écrous M10 100pcs', 13, 320, 40, 400, 20, 'WEB-92300'),
('ART-092', 'Barres HA Ø12mm 6m', 19, 190, 25, 240, 21, 'LMB-75016'),
('ART-093', 'Lambourde Sapin 50x75mm', 7, 580, 70, 650, 23, 'PARE-33000'),
('ART-094', 'Panneau Mélaminé Blanc', 23, 320, 40, 400, 24, 'PLK-44800'),
('ART-095', 'Contreplaqué Marine 18mm', 43, 95, 12, 120, 25, 'KNF-67000'),
('ART-096', 'Bardage Mélèze 120x20mm', 13, 280, 35, 350, 26, 'PARE-33000'),
('ART-097', 'Laine de Verre R=6 200mm', 25, 160, 20, 200, 27, 'ISOC-31000'),
('ART-098', 'Panneau Isolant Phonique', 29, 120, 15, 150, 28, 'ISOC-31000'),
('ART-099', 'Ouate de Cellulose 20kg', 33, 85, 12, 100, 29, 'TER-59000'),
('ART-100', 'Ballon Thermodynamique 200L', 1250, 12, 2, 15, 30, 'WEB-92300');

-- --------------------------------------------------------

--
-- Table structure for table `categorie`
--

CREATE TABLE `categorie` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `sousFamilleId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categorie`
--

INSERT INTO `categorie` (`id`, `nom`, `sousFamilleId`) VALUES
(3, 'produits chantiers', 7),
(4, 'Ciment CPJ 32.5', 7),
(5, 'Ciment CPJ 42.5', 7),
(6, 'Ciment Haut Fourneau', 7),
(7, 'Mortier de Jointoiement', 8),
(8, 'Mortier de Scellement', 8),
(9, 'Mortier Prêt à l\'Emploi', 8),
(10, 'Enduit de Lissage', 9),
(11, 'Crépi Facade', 9),
(12, 'Enduit Décoratif', 9),
(13, 'Colle C2', 10),
(14, 'Colle C1', 10),
(15, 'Colle Flex', 10),
(16, 'Chape Fluide', 11),
(17, 'Ragréage Autolissant', 11),
(18, 'Chape Traditionnelle', 11),
(19, 'Béton Fondation', 12),
(20, 'Béton Dalles', 12),
(21, 'Béton Armé', 12),
(22, 'Gravier 6/10', 13),
(23, 'Gravier 10/14', 13),
(24, 'Gravillon 4/6', 13),
(25, 'Sable 0/2', 14),
(26, 'Sable 0/4', 14),
(27, 'Sable de Rivière', 14),
(28, 'Poutrelles Béton', 15),
(29, 'Dalles Alvéolées', 15),
(30, 'Blocs à Bancher', 15),
(31, 'Plastifiant', 16),
(32, 'Accélérateur de Prise', 16),
(33, 'Antigel Béton', 16),
(34, 'Acier Laminé', 17),
(35, 'Acier Galvanisé', 17),
(36, 'Acier Inoxydable', 17),
(37, 'Poutres IPN', 18),
(38, 'Cornières Métalliques', 18),
(39, 'Tubes Carrés', 18),
(40, 'Tôle Galvanisée', 19),
(41, 'Grillage Soudé', 19),
(42, 'Treillis Soudé', 19),
(43, 'Tiges Filetées', 20),
(44, 'Écrous et Rondelles', 20),
(45, 'Goujons d\'Ancrage', 20),
(46, 'Treillis Soudé', 21),
(47, 'Barres HA', 21),
(48, 'Armatures Fondation', 21),
(49, 'Sapin Traité', 22),
(50, 'Chêne Massif', 22),
(51, 'Pin Maritime', 22),
(52, 'Lambourdes', 23),
(53, 'Solives', 23),
(54, 'Chevrons', 23),
(55, 'Aggloméré Standard', 24),
(56, 'Mélaminé Blanc', 24),
(57, 'Panneau Laminé', 24),
(58, 'Contreplaqué CTBX', 25),
(59, 'Contreplaqué Marine', 25),
(60, 'Contreplaqué Okoumé', 25),
(61, 'Lambris Pin', 26),
(62, 'Bardage Mélèze', 26),
(63, 'Lambris PVC', 26),
(64, 'Laine de Verre', 27),
(65, 'Polystyrène Expansé', 27),
(66, 'Panneaux Polyuréthane', 27),
(67, 'Laine de Roche', 28),
(68, 'Mousse Acoustique', 28),
(69, 'Panneaux Isolants', 28),
(70, 'Laine de Bois', 29),
(71, 'Ouate de Cellulose', 29),
(72, 'Fibre de Coco', 29),
(73, 'Panneaux Solaires', 30),
(74, 'Ballons Thermodynamiques', 30),
(75, 'Pompes à Chaleur', 30),
(76, 'VMC Simple Flux', 31),
(77, 'Ventilation Mécanique', 31),
(78, 'Grilles d\'Aération', 31),
(79, 'Portes Blanches', 32),
(80, 'Portes Placard', 32),
(81, 'Portes Battantes', 32),
(82, 'Portes Blindées', 33),
(83, 'Portes Acoustiques', 33),
(84, 'Portes Aluminium', 33),
(85, 'Fenêtres PVC', 34),
(86, 'Baies Coulissantes', 34),
(87, 'Velux et Lanterneaux', 34),
(88, 'Volets Roulants', 35),
(89, 'Stores Bannes', 35),
(90, 'Persiennes Bois', 35),
(91, 'Escaliers Droit', 36),
(92, 'Garde-Corps Verre', 36),
(93, 'Escaliers Hélicoïdaux', 36),
(94, 'Câbles H07V-U', 37),
(95, 'Fils R2V', 37),
(96, 'Câbles Souples', 37),
(97, 'Interrupteurs Va-et-Vient', 38),
(98, 'Prises 16A', 38),
(99, 'Prise RJ45', 38),
(100, 'Spots LED', 39),
(101, 'Plafonniers', 39),
(102, 'Appliques Murale', 39),
(103, 'Projecteurs Extérieurs', 40),
(104, 'Bornes Solaires', 40),
(105, 'Lampadaires LED', 40),
(106, 'Tableaux Divisionnaires', 41),
(107, 'Disjoncteurs 16A', 41),
(108, 'Interdifférentiels', 41),
(109, 'Tuyaux PVC', 42),
(110, 'Raccords Laiton', 42),
(111, 'Tuyaux PER', 42),
(112, 'Robinets de Lavabo', 43),
(113, 'Mitigeurs Évier', 43),
(114, 'Robinets de Jardin', 43),
(115, 'Éviers Inox', 44),
(116, 'Lavabos Céramique', 44),
(117, 'Éviers Granit', 44),
(118, 'WC Suspendus', 45),
(119, 'Broyeurs Sanitaires', 45),
(120, 'WC à Poser', 45),
(121, 'Siphons Lavabo', 46),
(122, 'Colonnes Descendantes', 46),
(123, 'Tuyaux Évacuation', 46),
(124, 'Carrelage Sol', 47),
(125, 'Faïence Murale', 47),
(126, 'Carrelage Extérieur', 47),
(127, 'Parquet Massif', 48),
(128, 'Stratifié Bois', 48),
(129, 'Parquet Flottant', 48),
(130, 'Peinture Acrylique', 49),
(131, 'Vernis Bois', 49),
(132, 'Peinture Facade', 49),
(133, 'Papier Intissé', 50),
(134, 'Papier Vinylique', 50),
(135, 'Papier Relief', 50),
(136, 'Plaques de Plâtre', 51),
(137, 'Grilles Techniques', 51),
(138, 'Plaques Minérales', 51),
(139, 'Marteaux et Masses', 52),
(140, 'Tournevis et Clés', 52),
(141, 'Pinces et Tenailles', 52),
(142, 'Perceuses et Visseuses', 53),
(143, 'Meuleuses et Disqueuses', 53),
(144, 'Scies Électriques', 53),
(145, 'Mètres Ruban', 54),
(146, 'Niveaux Laser', 54),
(147, 'Équerres et Rapporteurs', 54),
(148, 'Casques et Lunettes', 55),
(149, 'Gants de Protection', 55),
(150, 'Chaussures de Sécurité', 55),
(151, 'Échafaudages Roulants', 56),
(152, 'Échelles Coulissantes', 56),
(153, 'Échafaudages Fixes', 56),
(154, 'Béton de Propreté', 57),
(155, 'Semelles Filantes', 57),
(156, 'Pieux et Pieux', 57),
(157, 'Tuyaux Drainants', 58),
(158, 'Buses Béton', 58),
(159, 'Drains Agricoles', 58),
(160, 'Non Tissé 100g', 59),
(161, 'Tissé 200g', 59),
(162, 'Bidim Renforcé', 59),
(163, 'Membranes Bitume', 60),
(164, 'Feutres Asphaltés', 60),
(165, 'Résines Époxy', 60),
(166, 'Terre Végétale', 61),
(167, 'Cailloux Concassés', 61),
(168, 'Sable de Remblai', 61);

-- --------------------------------------------------------

--
-- Table structure for table `chantier`
--

CREATE TABLE `chantier` (
  `code` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `adresse` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chantier`
--

INSERT INTO `chantier` (`code`, `nom`, `adresse`) VALUES
('COM-33000-001', 'Centre Commercial Bordeaux-Lac', '45 Avenue du Lac, 33000 Bordeaux'),
('COM-76000-001', 'Parking Silo Centre-Ville Rouen', '23 Rue des Carmes, 76000 Rouen'),
('ECO-69007-001', 'Groupe Scolaire Jean Moulin', '18 Rue de l\'Université, 69007 Lyon'),
('HOP-59000-001', 'Extension CHRU Lille Sud', '12 Avenue Oscar Lambret, 59000 Lille'),
('IND-44800-001', 'Entrepôt Logistique Saint-Herblain', '34 Zone Industrielle Est, 44800 Saint-Herblain'),
('LOG-31000-001', 'Logements sociaux Saint-Cyprien', '89 Allée Charles de Fitte, 31000 Toulouse'),
('OFF-13002-001', 'Tour Marseille Business', '67 Rue de la République, 13002 Marseille'),
('PUB-92100-001', 'Rénovation Piscine Municipale', '56 Boulevard Jean Jaurès, 92100 Boulogne-Billancourt'),
('RES-67000-001', 'Immeuble Le Parc des Institutions', '78 Avenue de la Forêt Noire, 67000 Strasbourg'),
('RES-75015-001', 'Résidence Les Jardins du Seine', '25 Quai de Grenelle, 75015 Paris');

-- --------------------------------------------------------

--
-- Table structure for table `entree`
--

CREATE TABLE `entree` (
  `code` int(11) NOT NULL,
  `stockEntree` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `fournisseurCode` int(11) DEFAULT NULL,
  `articleCode` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fabriquant`
--

CREATE TABLE `fabriquant` (
  `code` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `adresse` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fabriquant`
--

INSERT INTO `fabriquant` (`code`, `nom`, `adresse`) VALUES
('BOS-69008', 'Bostik Findley', '78 Avenue Jean Jaurès, 69008 Lyon'),
('ISOC-31000', 'Isover Saint-Gobain', '67 Allée des Cèdres, 31000 Toulouse'),
('KNF-67000', 'Knauf France SAS', '18 Rue du Maréchal Leclerc, 67000 Strasbourg'),
('LMB-75016', 'Lafarge Matériaux Batiment', '61 Avenue de la Grande Armée, 75016 Paris'),
('PARE-33000', 'Parexlanko', '45 Quai de Paludate, 33000 Bordeaux'),
('PLK-44800', 'Placoplâtre', '12 Rue des Usines, 44800 Saint-Herblain'),
('SGP-92100', 'Saint-Gobain Plâtre', '12 Place de l\'Iris, 92100 Boulogne-Billancourt'),
('SIK-69100', 'Sika France', '25 Chemin des Vignes, 69100 Villeurbanne'),
('TER-59000', 'Tereos Bâtiment', '89 Boulevard de la Liberté, 59000 Lille'),
('WEB-92300', 'Weber & Broutin', '34 Rue de la République, 92300 Levallois-Perret');

-- --------------------------------------------------------

--
-- Table structure for table `famille`
--

CREATE TABLE `famille` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `famille`
--

INSERT INTO `famille` (`id`, `nom`) VALUES
(4, 'Bois'),
(5, 'Ciments et Mortiers'),
(6, 'Bétons et Agrégats'),
(7, 'Métaux et Aciers'),
(8, 'Bois et Dérivés'),
(9, 'Isolations et Énergies'),
(10, 'Menuiseries et Fermetures'),
(11, 'Électricité et Éclairage'),
(12, 'Plomberie et Sanitaires'),
(13, 'Revêtements et Finitions'),
(14, 'Outillage et Équipement');

-- --------------------------------------------------------

--
-- Table structure for table `fournisseur`
--

CREATE TABLE `fournisseur` (
  `code` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `adresse` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fournisseur`
--

INSERT INTO `fournisseur` (`code`, `nom`, `contact`, `adresse`) VALUES
(3, 'BricoPro France', 'contact@bricopro.fr - 01 45 67 89 10', '123 Avenue des Constructeurs, 75012 Paris'),
(4, 'Materiaux Plus', 'commande@materiauxplus.com - 04 72 34 56 78', '45 Rue des Artisans, 69002 Lyon'),
(5, 'Gedimat Distribution', 'client@gedimat.fr - 05 56 78 90 12', '67 Boulevard Industriel, 33000 Bordeaux'),
(6, 'Point P Batiment', 'info@pointp.fr - 03 20 45 67 89', '89 Rue du Chantier, 59000 Lille'),
(7, 'Leroy Merlin Pro', 'pro@leroymerlin.fr - 02 40 12 34 56', '234 Zone Industrielle Sud, 44000 Nantes'),
(8, 'Saint-Gobain Distribution', 'fournisseur@saint-gobain.com - 01 30 45 67 89', '12 Chemin des Usines, 78200 Mantes-la-Jolie'),
(9, 'Brico Dépôt Pro', 'pro@bricodepot.fr - 04 84 56 78 90', '56 Avenue de l\'Industrie, 13015 Marseille'),
(10, 'Knauf France', 'commercial@knauf.fr - 03 80 12 34 56', '78 Rue des Carrières, 21000 Dijon'),
(11, 'Weber France', 'weber@weber.fr - 02 35 67 89 01', '34 Impasse des Mortiers, 76000 Rouen'),
(12, 'Prolians Batiment', 'contact@prolians.com - 05 61 23 45 67', '90 Allée des Entrepreneurs, 31000 Toulouse');

-- --------------------------------------------------------

--
-- Table structure for table `sortie`
--

CREATE TABLE `sortie` (
  `code` int(11) NOT NULL,
  `stockSortie` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `articleCode` varchar(255) DEFAULT NULL,
  `chantierCode` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sous_famille`
--

CREATE TABLE `sous_famille` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `familleId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sous_famille`
--

INSERT INTO `sous_famille` (`id`, `nom`, `familleId`) VALUES
(7, 'Materiel', 4),
(8, 'Ciments Portland', 4),
(9, 'Mortiers de Montage', 4),
(10, 'Enduits et Crépis', 4),
(11, 'Colles Carrelage', 4),
(12, 'Chapes et Ragréages', 4),
(13, 'Bétons Prêts à l\'Emploi', 5),
(14, 'Graviers et Gravillons', 5),
(15, 'Sables de Construction', 5),
(16, 'Bétons Préfabriqués', 5),
(17, 'Adjuvants Béton', 5),
(18, 'Aciers de Construction', 6),
(19, 'Profilés Métalliques', 6),
(20, 'Tôles et Tresses', 6),
(21, 'Quincaillerie Métallique', 6),
(22, 'Ferraillage Béton', 6),
(23, 'Bois de Charpente', 7),
(24, 'Bois d\'Ossature', 7),
(25, 'Panneaux de Particules', 7),
(26, 'Contreplaqués', 7),
(27, 'Lambris et Bardages', 7),
(28, 'Isolants Thermiques', 8),
(29, 'Isolants Phoniques', 8),
(30, 'Isolants Naturels', 8),
(31, 'Énergies Renouvelables', 8),
(32, 'Ventilation et Aération', 8),
(33, 'Portes d\'Intérieur', 9),
(34, 'Portes d\'Entrée', 9),
(35, 'Fenêtres et Baies', 9),
(36, 'Volets et Stores', 9),
(37, 'Escaliers et Garde-Corps', 9),
(38, 'Câbles et Fils Électriques', 10),
(39, 'Interrupteurs et Prises', 10),
(40, 'Éclairage Intérieur', 10),
(41, 'Éclairage Extérieur', 10),
(42, 'Tableaux et Disjoncteurs', 10),
(43, 'Tuyaux et Raccords', 11),
(44, 'Robinetterie et Mitigeurs', 11),
(45, 'Éviers et Lavabos', 11),
(46, 'WC et Broyeurs', 11),
(47, 'Systèmes d\'Évacuation', 11),
(48, 'Carrelages et Faïences', 12),
(49, 'Parquets et Stratifiés', 12),
(50, 'Peintures et Vernis', 12),
(51, 'Papiers Peints', 12),
(52, 'Plafonds Suspendus', 12),
(53, 'Outils à Main', 13),
(54, 'Outils Électroportatifs', 13),
(55, 'Outils de Mesure', 13),
(56, 'Équipement de Sécurité', 13),
(57, 'Échafaudages et Échelles', 13),
(58, 'Matériaux de Fondation', 14),
(59, 'Drains et Égouts', 14),
(60, 'Géotextiles', 14),
(61, 'Étanchéité et Étanchéité', 14),
(62, 'Matériaux de Terrassement', 14);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `article`
--
ALTER TABLE `article`
  ADD PRIMARY KEY (`code`),
  ADD KEY `FK_afcf013647de613cf39111a7ee8` (`categorieId`),
  ADD KEY `FK_297fa5322d89b51be14225198b4` (`fabriquantCode`);

--
-- Indexes for table `categorie`
--
ALTER TABLE `categorie`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_a382276317aa918829a05cd19db` (`sousFamilleId`);

--
-- Indexes for table `chantier`
--
ALTER TABLE `chantier`
  ADD PRIMARY KEY (`code`);

--
-- Indexes for table `entree`
--
ALTER TABLE `entree`
  ADD PRIMARY KEY (`code`),
  ADD KEY `FK_5d89f9841cfa7f41199997052b2` (`fournisseurCode`),
  ADD KEY `FK_cdef34ca49b41f932278274fa18` (`articleCode`);

--
-- Indexes for table `fabriquant`
--
ALTER TABLE `fabriquant`
  ADD PRIMARY KEY (`code`);

--
-- Indexes for table `famille`
--
ALTER TABLE `famille`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fournisseur`
--
ALTER TABLE `fournisseur`
  ADD PRIMARY KEY (`code`);

--
-- Indexes for table `sortie`
--
ALTER TABLE `sortie`
  ADD PRIMARY KEY (`code`),
  ADD KEY `FK_b98a8475bb156077da74fc28808` (`articleCode`),
  ADD KEY `FK_1cc969a911c04122cc8ec086f83` (`chantierCode`);

--
-- Indexes for table `sous_famille`
--
ALTER TABLE `sous_famille`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_d192b6c256a3abf51367cdbf52a` (`familleId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categorie`
--
ALTER TABLE `categorie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=169;

--
-- AUTO_INCREMENT for table `entree`
--
ALTER TABLE `entree`
  MODIFY `code` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `famille`
--
ALTER TABLE `famille`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `fournisseur`
--
ALTER TABLE `fournisseur`
  MODIFY `code` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `sortie`
--
ALTER TABLE `sortie`
  MODIFY `code` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sous_famille`
--
ALTER TABLE `sous_famille`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `article`
--
ALTER TABLE `article`
  ADD CONSTRAINT `FK_297fa5322d89b51be14225198b4` FOREIGN KEY (`fabriquantCode`) REFERENCES `fabriquant` (`code`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_afcf013647de613cf39111a7ee8` FOREIGN KEY (`categorieId`) REFERENCES `categorie` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `categorie`
--
ALTER TABLE `categorie`
  ADD CONSTRAINT `FK_a382276317aa918829a05cd19db` FOREIGN KEY (`sousFamilleId`) REFERENCES `sous_famille` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `entree`
--
ALTER TABLE `entree`
  ADD CONSTRAINT `FK_5d89f9841cfa7f41199997052b2` FOREIGN KEY (`fournisseurCode`) REFERENCES `fournisseur` (`code`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_cdef34ca49b41f932278274fa18` FOREIGN KEY (`articleCode`) REFERENCES `article` (`code`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `sortie`
--
ALTER TABLE `sortie`
  ADD CONSTRAINT `FK_1cc969a911c04122cc8ec086f83` FOREIGN KEY (`chantierCode`) REFERENCES `chantier` (`code`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_b98a8475bb156077da74fc28808` FOREIGN KEY (`articleCode`) REFERENCES `article` (`code`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `sous_famille`
--
ALTER TABLE `sous_famille`
  ADD CONSTRAINT `FK_d192b6c256a3abf51367cdbf52a` FOREIGN KEY (`familleId`) REFERENCES `famille` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
