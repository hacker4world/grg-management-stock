"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sortie = void 0;
// entity/Sortie.ts
const typeorm_1 = require("typeorm");
const Chantier_1 = require("./Chantier");
const ArticleSortie_1 = require("./ArticleSortie");
const Compte_1 = require("./Compte");
const Document_1 = require("./Document");
const Depot_1 = require("./Depot");
let Sortie = class Sortie {
};
exports.Sortie = Sortie;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Sortie.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], Sortie.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Sortie.prototype, "observation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 30 }),
    __metadata("design:type", String)
], Sortie.prototype, "typeSortie", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ArticleSortie_1.ArticleSortie, (as) => as.sortie, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Sortie.prototype, "articleSorties", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "pending" }),
    __metadata("design:type", String)
], Sortie.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Compte_1.Compte, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "compteId" }),
    __metadata("design:type", Compte_1.Compte)
], Sortie.prototype, "compte", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Document_1.Document, (d) => d.sortie),
    __metadata("design:type", Array)
], Sortie.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Depot_1.Depot, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "depotId" }),
    __metadata("design:type", Depot_1.Depot)
], Sortie.prototype, "depot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Sortie.prototype, "nomTransporteurDepot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Sortie.prototype, "matriculeTransporteurDepot", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Chantier_1.Chantier, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "chantierId" }),
    __metadata("design:type", Chantier_1.Chantier)
], Sortie.prototype, "chantier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Sortie.prototype, "nomTransporteurChantier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Sortie.prototype, "matriculeTransporteurChantier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 30, nullable: true }),
    __metadata("design:type", String)
], Sortie.prototype, "sousTypeSortieExterne", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Sortie.prototype, "nomEntreprise", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Sortie.prototype, "adresseEntreprise", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Sortie.prototype, "matriculeFiscalEntreprise", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Sortie.prototype, "nomClient", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Sortie.prototype, "nomTransporteurExterne", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], Sortie.prototype, "matriculeTransporteurExterne", void 0);
exports.Sortie = Sortie = __decorate([
    (0, typeorm_1.Entity)()
], Sortie);
//# sourceMappingURL=Sortie.js.map