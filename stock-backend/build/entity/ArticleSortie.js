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
exports.ArticleSortie = void 0;
const typeorm_1 = require("typeorm");
const Article_1 = require("./Article");
const Sortie_1 = require("./Sortie");
let ArticleSortie = class ArticleSortie {
};
exports.ArticleSortie = ArticleSortie;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ArticleSortie.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sortie_1.Sortie, (s) => s.articleSorties, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "sortieId" }),
    __metadata("design:type", Sortie_1.Sortie)
], ArticleSortie.prototype, "sortie", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "articleId" }),
    __metadata("design:type", Article_1.Article)
], ArticleSortie.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ArticleSortie.prototype, "stockSortie", void 0);
exports.ArticleSortie = ArticleSortie = __decorate([
    (0, typeorm_1.Entity)()
], ArticleSortie);
//# sourceMappingURL=ArticleSortie.js.map