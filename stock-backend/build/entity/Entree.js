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
exports.Entree = void 0;
const typeorm_1 = require("typeorm");
const Fournisseur_1 = require("./Fournisseur");
const Fabriquant_1 = require("./Fabriquant");
const Document_1 = require("./Document");
const Compte_1 = require("./Compte"); // Import Compte entity
const EntreeArticleItem_1 = require("./EntreeArticleItem");
let Entree = class Entree {
};
exports.Entree = Entree;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Entree.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], Entree.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Entree.prototype, "observation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "pending" }),
    __metadata("design:type", String)
], Entree.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Fournisseur_1.Fournisseur, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "fournisseurId" }),
    __metadata("design:type", Fournisseur_1.Fournisseur)
], Entree.prototype, "fournisseur", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Fabriquant_1.Fabriquant, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "fabriquantId" }),
    __metadata("design:type", Fabriquant_1.Fabriquant)
], Entree.prototype, "fabriquant", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Compte_1.Compte, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "compteId" }),
    __metadata("design:type", Compte_1.Compte)
], Entree.prototype, "compte", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Document_1.Document, (d) => d.entree),
    __metadata("design:type", Array)
], Entree.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EntreeArticleItem_1.EntreeArticleItem, (e) => e.entree),
    __metadata("design:type", Array)
], Entree.prototype, "entreeArticleItems", void 0);
exports.Entree = Entree = __decorate([
    (0, typeorm_1.Entity)()
], Entree);
//# sourceMappingURL=Entree.js.map