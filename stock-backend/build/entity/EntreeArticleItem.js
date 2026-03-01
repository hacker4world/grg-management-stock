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
exports.EntreeArticleItem = void 0;
const typeorm_1 = require("typeorm");
const Entree_1 = require("./Entree");
const Article_1 = require("./Article");
// entity/EntreeArticleItem.ts
let EntreeArticleItem = class EntreeArticleItem {
};
exports.EntreeArticleItem = EntreeArticleItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EntreeArticleItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Entree_1.Entree, (e) => e.entreeArticleItems, { onDelete: "CASCADE" }),
    __metadata("design:type", Entree_1.Entree)
], EntreeArticleItem.prototype, "entree", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article, { onDelete: "CASCADE" }),
    __metadata("design:type", Article_1.Article)
], EntreeArticleItem.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { unsigned: true }),
    __metadata("design:type", Number)
], EntreeArticleItem.prototype, "stockEntree", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], EntreeArticleItem.prototype, "prix", void 0);
exports.EntreeArticleItem = EntreeArticleItem = __decorate([
    (0, typeorm_1.Entity)()
], EntreeArticleItem);
//# sourceMappingURL=EntreeArticleItem.js.map