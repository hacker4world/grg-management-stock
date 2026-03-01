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
exports.Categorie = void 0;
const typeorm_1 = require("typeorm");
const SousFamille_1 = require("./SousFamille");
const Article_1 = require("./Article");
let Categorie = class Categorie {
};
exports.Categorie = Categorie;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Categorie.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Categorie.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SousFamille_1.SousFamille, (sous_famille) => sous_famille.categories, {
        nullable: true,
        onDelete: "SET NULL",
    }),
    __metadata("design:type", SousFamille_1.SousFamille)
], Categorie.prototype, "sous_famille", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Article_1.Article, (article) => article.categorie),
    __metadata("design:type", Array)
], Categorie.prototype, "articles", void 0);
exports.Categorie = Categorie = __decorate([
    (0, typeorm_1.Entity)()
], Categorie);
//# sourceMappingURL=Categorie.js.map