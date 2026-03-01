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
exports.RetourArticleItem = void 0;
const typeorm_1 = require("typeorm");
const Article_1 = require("./Article");
const RetourArticle_1 = require("./RetourArticle");
let RetourArticleItem = class RetourArticleItem {
};
exports.RetourArticleItem = RetourArticleItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RetourArticleItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], RetourArticleItem.prototype, "quantite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], RetourArticleItem.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => RetourArticle_1.RetourArticle, (r) => r.items, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "retourId" }),
    __metadata("design:type", RetourArticle_1.RetourArticle)
], RetourArticleItem.prototype, "retour", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "articleId" }),
    __metadata("design:type", Article_1.Article)
], RetourArticleItem.prototype, "article", void 0);
exports.RetourArticleItem = RetourArticleItem = __decorate([
    (0, typeorm_1.Entity)()
], RetourArticleItem);
//# sourceMappingURL=RetourArticleItem.js.map