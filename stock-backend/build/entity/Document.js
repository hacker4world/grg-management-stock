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
exports.Document = void 0;
const typeorm_1 = require("typeorm");
const Entree_1 = require("./Entree");
const DemandeArticle_1 = require("./DemandeArticle");
const Sortie_1 = require("./Sortie");
const RetourArticle_1 = require("./RetourArticle");
let Document = class Document {
};
exports.Document = Document;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Document.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Document.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Document.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Document.prototype, "originalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 500 }),
    __metadata("design:type", String)
], Document.prototype, "path", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Document.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", unsigned: true }),
    __metadata("design:type", Number)
], Document.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Document.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Entree_1.Entree, (e) => e.documents, {
        nullable: true,
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "entreeId" }),
    __metadata("design:type", Entree_1.Entree)
], Document.prototype, "entree", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DemandeArticle_1.DemandeArticle, (d) => d.documents, {
        nullable: true,
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "demandeArticleId" }),
    __metadata("design:type", DemandeArticle_1.DemandeArticle)
], Document.prototype, "demandeArticle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sortie_1.Sortie, (s) => s.documents, {
        nullable: true,
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "sortieId" }),
    __metadata("design:type", Sortie_1.Sortie)
], Document.prototype, "sortie", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => RetourArticle_1.RetourArticle, (r) => r.documents, {
        nullable: true,
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "retourId" }),
    __metadata("design:type", RetourArticle_1.RetourArticle)
], Document.prototype, "retour", void 0);
exports.Document = Document = __decorate([
    (0, typeorm_1.Entity)()
], Document);
//# sourceMappingURL=Document.js.map