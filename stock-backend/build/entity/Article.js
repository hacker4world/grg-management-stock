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
exports.Article = void 0;
const typeorm_1 = require("typeorm");
const Categorie_1 = require("./Categorie");
const Depot_1 = require("./Depot");
const Unite_1 = require("./Unite");
let Article = class Article {
};
exports.Article = Article;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Article.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Article.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Article.prototype, "stockMinimum", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Article.prototype, "stockActuel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Article.prototype, "prixMoyenne", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Depot_1.Depot, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "depotId" }),
    __metadata("design:type", Depot_1.Depot)
], Article.prototype, "depot", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Unite_1.Unite, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "uniteId" }),
    __metadata("design:type", Unite_1.Unite)
], Article.prototype, "unite", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Categorie_1.Categorie, { onDelete: "SET NULL", nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "categorieId" }),
    __metadata("design:type", Categorie_1.Categorie)
], Article.prototype, "categorie", void 0);
exports.Article = Article = __decorate([
    (0, typeorm_1.Entity)()
], Article);
//# sourceMappingURL=Article.js.map