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
exports.DemandeArticleItem = void 0;
const typeorm_1 = require("typeorm");
const Article_1 = require("./Article");
const DemandeArticle_1 = require("./DemandeArticle");
let DemandeArticleItem = class DemandeArticleItem {
};
exports.DemandeArticleItem = DemandeArticleItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DemandeArticleItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], DemandeArticleItem.prototype, "quantite", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DemandeArticle_1.DemandeArticle, (d) => d.items, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "demandeId" }),
    __metadata("design:type", DemandeArticle_1.DemandeArticle)
], DemandeArticleItem.prototype, "demande", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "articleId" }),
    __metadata("design:type", Article_1.Article)
], DemandeArticleItem.prototype, "article", void 0);
exports.DemandeArticleItem = DemandeArticleItem = __decorate([
    (0, typeorm_1.Entity)()
], DemandeArticleItem);
//# sourceMappingURL=DemandeArticleItem.js.map