import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1775642081744 implements MigrationInterface {
    name = 'Migration1775642081744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`famille\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nom\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sous_famille\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nom\` varchar(255) NOT NULL, \`familleId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`categorie\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nom\` varchar(255) NOT NULL, \`sousFamilleId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`compte\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nom\` varchar(255) NOT NULL, \`prenom\` varchar(255) NOT NULL, \`nom_utilisateur\` varchar(255) NOT NULL, \`motdepasse\` varchar(255) NOT NULL, \`confirme\` tinyint NOT NULL, \`role\` varchar(255) NOT NULL DEFAULT '', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chantier\` (\`code\` int NOT NULL AUTO_INCREMENT, \`nom\` varchar(255) NOT NULL, \`adresse\` varchar(255) NOT NULL, \`compteId\` int NULL, PRIMARY KEY (\`code\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`article_sortie\` (\`id\` int NOT NULL AUTO_INCREMENT, \`stockSortie\` decimal(10,2) NOT NULL, \`sortieId\` int NULL, \`articleId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`fournisseur\` (\`code\` int NOT NULL AUTO_INCREMENT, \`nom\` varchar(255) NOT NULL, \`contact\` varchar(255) NOT NULL, \`adresse\` varchar(255) NOT NULL, PRIMARY KEY (\`code\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`fabriquant\` (\`code\` int NOT NULL AUTO_INCREMENT, \`nom\` varchar(255) NOT NULL, \`adresse\` varchar(255) NOT NULL, \`contact\` varchar(255) NOT NULL, PRIMARY KEY (\`code\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`entree_article_item\` (\`id\` int NOT NULL AUTO_INCREMENT, \`stockEntree\` int UNSIGNED NOT NULL, \`prix\` decimal(10,2) NOT NULL, \`entreeId\` int NULL, \`articleId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`entree\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` date NOT NULL, \`observation\` text NULL, \`status\` varchar(20) NOT NULL DEFAULT 'pending', \`fournisseurId\` int NULL, \`fabriquantId\` int NULL, \`compteId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`demande_article_item\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantite\` int NOT NULL, \`demandeId\` int NULL, \`articleId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`demande_article\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` date NOT NULL, \`status\` varchar(20) NOT NULL DEFAULT 'pending', \`observation\` text NULL, \`chantierCode\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`retour_article_item\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantite\` int NOT NULL, \`reason\` varchar(255) NOT NULL, \`retourId\` int NULL, \`articleId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`retour_article\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` date NOT NULL, \`status\` varchar(20) NOT NULL DEFAULT 'pending', \`observation\` text NULL, \`nomTransporteur\` varchar(100) NULL, \`matriculeTransporteur\` varchar(50) NULL, \`chantierCode\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`document\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(50) NOT NULL, \`filename\` varchar(255) NOT NULL, \`originalName\` varchar(255) NOT NULL, \`path\` varchar(500) NOT NULL, \`mimeType\` varchar(100) NOT NULL, \`size\` int UNSIGNED NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`entreeId\` int NULL, \`demandeArticleId\` int NULL, \`sortieId\` int NULL, \`retourId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sortie\` (\`id\` int NOT NULL AUTO_INCREMENT, \`date\` date NOT NULL, \`observation\` text NULL, \`typeSortie\` varchar(30) NOT NULL, \`status\` varchar(20) NOT NULL DEFAULT 'pending', \`nomTransporteurDepot\` varchar(255) NULL, \`matriculeTransporteurDepot\` varchar(100) NULL, \`nomTransporteurChantier\` varchar(255) NULL, \`matriculeTransporteurChantier\` varchar(100) NULL, \`sousTypeSortieExterne\` varchar(30) NULL, \`nomEntreprise\` varchar(255) NULL, \`adresseEntreprise\` text NULL, \`matriculeFiscalEntreprise\` varchar(100) NULL, \`nomClient\` varchar(255) NULL, \`nomTransporteurExterne\` varchar(255) NULL, \`matriculeTransporteurExterne\` varchar(100) NULL, \`compteId\` int NULL, \`depotId\` int NULL, \`chantierId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`depot\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nom\` varchar(255) NOT NULL, \`adresse\` varchar(500) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`unite\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nom\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`article\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nom\` varchar(255) NOT NULL, \`stockMinimum\` int NOT NULL, \`stockActuel\` int NOT NULL, \`prixMoyenne\` int NOT NULL, \`depotId\` int NULL, \`uniteId\` int NULL, \`categorieId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stock_notification\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(50) NOT NULL, \`message\` varchar(500) NOT NULL, \`stockActuel\` int NOT NULL, \`stockMinimum\` int NOT NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`articleId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`sous_famille\` ADD CONSTRAINT \`FK_d192b6c256a3abf51367cdbf52a\` FOREIGN KEY (\`familleId\`) REFERENCES \`famille\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`categorie\` ADD CONSTRAINT \`FK_a382276317aa918829a05cd19db\` FOREIGN KEY (\`sousFamilleId\`) REFERENCES \`sous_famille\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chantier\` ADD CONSTRAINT \`FK_3f72b0d873e5dae4d4b7311dbcb\` FOREIGN KEY (\`compteId\`) REFERENCES \`compte\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`article_sortie\` ADD CONSTRAINT \`FK_b8c89ac969377bdf6ba805ada6a\` FOREIGN KEY (\`sortieId\`) REFERENCES \`sortie\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`article_sortie\` ADD CONSTRAINT \`FK_0a88db87819fa5bf9111524f1e0\` FOREIGN KEY (\`articleId\`) REFERENCES \`article\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`entree_article_item\` ADD CONSTRAINT \`FK_71573629a301229e36dc2ddfec0\` FOREIGN KEY (\`entreeId\`) REFERENCES \`entree\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`entree_article_item\` ADD CONSTRAINT \`FK_296aafc9d6cd546b0772d40ac0b\` FOREIGN KEY (\`articleId\`) REFERENCES \`article\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`entree\` ADD CONSTRAINT \`FK_7b21c98377325b20d4482742baa\` FOREIGN KEY (\`fournisseurId\`) REFERENCES \`fournisseur\`(\`code\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`entree\` ADD CONSTRAINT \`FK_047c10a9e8f3fa5d0698bbf954c\` FOREIGN KEY (\`fabriquantId\`) REFERENCES \`fabriquant\`(\`code\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`entree\` ADD CONSTRAINT \`FK_8137598c6e3b38a0656adeb4d2f\` FOREIGN KEY (\`compteId\`) REFERENCES \`compte\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demande_article_item\` ADD CONSTRAINT \`FK_91b3e1ff8847bce73c9cf303cc3\` FOREIGN KEY (\`demandeId\`) REFERENCES \`demande_article\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demande_article_item\` ADD CONSTRAINT \`FK_4234cec869adea96e6fac1aef41\` FOREIGN KEY (\`articleId\`) REFERENCES \`article\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`demande_article\` ADD CONSTRAINT \`FK_94eac66e2543b0bc4e046c28e56\` FOREIGN KEY (\`chantierCode\`) REFERENCES \`chantier\`(\`code\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`retour_article_item\` ADD CONSTRAINT \`FK_8b228fd94c7dc2927c8b58331c7\` FOREIGN KEY (\`retourId\`) REFERENCES \`retour_article\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`retour_article_item\` ADD CONSTRAINT \`FK_61c13f2b326e8d22afde89d1914\` FOREIGN KEY (\`articleId\`) REFERENCES \`article\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`retour_article\` ADD CONSTRAINT \`FK_3a4adba18a10e08d6f6fc54b02f\` FOREIGN KEY (\`chantierCode\`) REFERENCES \`chantier\`(\`code\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`document\` ADD CONSTRAINT \`FK_bce6e9d9da381036366b07aaa23\` FOREIGN KEY (\`entreeId\`) REFERENCES \`entree\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`document\` ADD CONSTRAINT \`FK_d95c09c7749df9d1bd8a8e49805\` FOREIGN KEY (\`demandeArticleId\`) REFERENCES \`demande_article\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`document\` ADD CONSTRAINT \`FK_67b9e65d57e8a9805e2d112e43b\` FOREIGN KEY (\`sortieId\`) REFERENCES \`sortie\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`document\` ADD CONSTRAINT \`FK_cf7c5f4ee3fc230bc5ecbcdb7d2\` FOREIGN KEY (\`retourId\`) REFERENCES \`retour_article\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sortie\` ADD CONSTRAINT \`FK_fbf8985343a9e1a3e99df01ed0c\` FOREIGN KEY (\`compteId\`) REFERENCES \`compte\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sortie\` ADD CONSTRAINT \`FK_c9beed2fa2623e28c2673314c33\` FOREIGN KEY (\`depotId\`) REFERENCES \`depot\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sortie\` ADD CONSTRAINT \`FK_34d9aac54b48a8accdd71b4dc10\` FOREIGN KEY (\`chantierId\`) REFERENCES \`chantier\`(\`code\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`article\` ADD CONSTRAINT \`FK_b304bf204a8404680270e02697d\` FOREIGN KEY (\`depotId\`) REFERENCES \`depot\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`article\` ADD CONSTRAINT \`FK_b101b168a762afa58d84ca1a263\` FOREIGN KEY (\`uniteId\`) REFERENCES \`unite\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`article\` ADD CONSTRAINT \`FK_afcf013647de613cf39111a7ee8\` FOREIGN KEY (\`categorieId\`) REFERENCES \`categorie\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stock_notification\` ADD CONSTRAINT \`FK_35cd9f9aeb8f1569fff6b831220\` FOREIGN KEY (\`articleId\`) REFERENCES \`article\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`stock_notification\` DROP FOREIGN KEY \`FK_35cd9f9aeb8f1569fff6b831220\``);
        await queryRunner.query(`ALTER TABLE \`article\` DROP FOREIGN KEY \`FK_afcf013647de613cf39111a7ee8\``);
        await queryRunner.query(`ALTER TABLE \`article\` DROP FOREIGN KEY \`FK_b101b168a762afa58d84ca1a263\``);
        await queryRunner.query(`ALTER TABLE \`article\` DROP FOREIGN KEY \`FK_b304bf204a8404680270e02697d\``);
        await queryRunner.query(`ALTER TABLE \`sortie\` DROP FOREIGN KEY \`FK_34d9aac54b48a8accdd71b4dc10\``);
        await queryRunner.query(`ALTER TABLE \`sortie\` DROP FOREIGN KEY \`FK_c9beed2fa2623e28c2673314c33\``);
        await queryRunner.query(`ALTER TABLE \`sortie\` DROP FOREIGN KEY \`FK_fbf8985343a9e1a3e99df01ed0c\``);
        await queryRunner.query(`ALTER TABLE \`document\` DROP FOREIGN KEY \`FK_cf7c5f4ee3fc230bc5ecbcdb7d2\``);
        await queryRunner.query(`ALTER TABLE \`document\` DROP FOREIGN KEY \`FK_67b9e65d57e8a9805e2d112e43b\``);
        await queryRunner.query(`ALTER TABLE \`document\` DROP FOREIGN KEY \`FK_d95c09c7749df9d1bd8a8e49805\``);
        await queryRunner.query(`ALTER TABLE \`document\` DROP FOREIGN KEY \`FK_bce6e9d9da381036366b07aaa23\``);
        await queryRunner.query(`ALTER TABLE \`retour_article\` DROP FOREIGN KEY \`FK_3a4adba18a10e08d6f6fc54b02f\``);
        await queryRunner.query(`ALTER TABLE \`retour_article_item\` DROP FOREIGN KEY \`FK_61c13f2b326e8d22afde89d1914\``);
        await queryRunner.query(`ALTER TABLE \`retour_article_item\` DROP FOREIGN KEY \`FK_8b228fd94c7dc2927c8b58331c7\``);
        await queryRunner.query(`ALTER TABLE \`demande_article\` DROP FOREIGN KEY \`FK_94eac66e2543b0bc4e046c28e56\``);
        await queryRunner.query(`ALTER TABLE \`demande_article_item\` DROP FOREIGN KEY \`FK_4234cec869adea96e6fac1aef41\``);
        await queryRunner.query(`ALTER TABLE \`demande_article_item\` DROP FOREIGN KEY \`FK_91b3e1ff8847bce73c9cf303cc3\``);
        await queryRunner.query(`ALTER TABLE \`entree\` DROP FOREIGN KEY \`FK_8137598c6e3b38a0656adeb4d2f\``);
        await queryRunner.query(`ALTER TABLE \`entree\` DROP FOREIGN KEY \`FK_047c10a9e8f3fa5d0698bbf954c\``);
        await queryRunner.query(`ALTER TABLE \`entree\` DROP FOREIGN KEY \`FK_7b21c98377325b20d4482742baa\``);
        await queryRunner.query(`ALTER TABLE \`entree_article_item\` DROP FOREIGN KEY \`FK_296aafc9d6cd546b0772d40ac0b\``);
        await queryRunner.query(`ALTER TABLE \`entree_article_item\` DROP FOREIGN KEY \`FK_71573629a301229e36dc2ddfec0\``);
        await queryRunner.query(`ALTER TABLE \`article_sortie\` DROP FOREIGN KEY \`FK_0a88db87819fa5bf9111524f1e0\``);
        await queryRunner.query(`ALTER TABLE \`article_sortie\` DROP FOREIGN KEY \`FK_b8c89ac969377bdf6ba805ada6a\``);
        await queryRunner.query(`ALTER TABLE \`chantier\` DROP FOREIGN KEY \`FK_3f72b0d873e5dae4d4b7311dbcb\``);
        await queryRunner.query(`ALTER TABLE \`categorie\` DROP FOREIGN KEY \`FK_a382276317aa918829a05cd19db\``);
        await queryRunner.query(`ALTER TABLE \`sous_famille\` DROP FOREIGN KEY \`FK_d192b6c256a3abf51367cdbf52a\``);
        await queryRunner.query(`DROP TABLE \`stock_notification\``);
        await queryRunner.query(`DROP TABLE \`article\``);
        await queryRunner.query(`DROP TABLE \`unite\``);
        await queryRunner.query(`DROP TABLE \`depot\``);
        await queryRunner.query(`DROP TABLE \`sortie\``);
        await queryRunner.query(`DROP TABLE \`document\``);
        await queryRunner.query(`DROP TABLE \`retour_article\``);
        await queryRunner.query(`DROP TABLE \`retour_article_item\``);
        await queryRunner.query(`DROP TABLE \`demande_article\``);
        await queryRunner.query(`DROP TABLE \`demande_article_item\``);
        await queryRunner.query(`DROP TABLE \`entree\``);
        await queryRunner.query(`DROP TABLE \`entree_article_item\``);
        await queryRunner.query(`DROP TABLE \`fabriquant\``);
        await queryRunner.query(`DROP TABLE \`fournisseur\``);
        await queryRunner.query(`DROP TABLE \`article_sortie\``);
        await queryRunner.query(`DROP TABLE \`chantier\``);
        await queryRunner.query(`DROP TABLE \`compte\``);
        await queryRunner.query(`DROP TABLE \`categorie\``);
        await queryRunner.query(`DROP TABLE \`sous_famille\``);
        await queryRunner.query(`DROP TABLE \`famille\``);
    }

}
