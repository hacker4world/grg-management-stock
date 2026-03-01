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
exports.RetourArticle = void 0;
const typeorm_1 = require("typeorm");
const Chantier_1 = require("./Chantier");
const RetourArticleItem_1 = require("./RetourArticleItem");
const Document_1 = require("./Document");
let RetourArticle = class RetourArticle {
};
exports.RetourArticle = RetourArticle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RetourArticle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], RetourArticle.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Chantier_1.Chantier, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "chantierCode" }),
    __metadata("design:type", Chantier_1.Chantier)
], RetourArticle.prototype, "chantier", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RetourArticleItem_1.RetourArticleItem, (item) => item.retour),
    __metadata("design:type", Array)
], RetourArticle.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "pending" }),
    __metadata("design:type", String)
], RetourArticle.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Document_1.Document, (d) => d.retour),
    __metadata("design:type", Array)
], RetourArticle.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], RetourArticle.prototype, "observation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], RetourArticle.prototype, "nomTransporteur", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], RetourArticle.prototype, "matriculeTransporteur", void 0);
exports.RetourArticle = RetourArticle = __decorate([
    (0, typeorm_1.Entity)()
], RetourArticle);
//# sourceMappingURL=RetourArticle.js.map