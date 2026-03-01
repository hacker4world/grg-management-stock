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
exports.SousFamille = void 0;
const typeorm_1 = require("typeorm");
const Famille_1 = require("./Famille");
const Categorie_1 = require("./Categorie");
let SousFamille = class SousFamille {
};
exports.SousFamille = SousFamille;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SousFamille.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SousFamille.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Famille_1.Famille, (famille) => famille.sous_familles, {
        nullable: true,
        onDelete: "SET NULL",
    }),
    __metadata("design:type", Famille_1.Famille)
], SousFamille.prototype, "famille", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Categorie_1.Categorie, (category) => category.sous_famille),
    __metadata("design:type", Array)
], SousFamille.prototype, "categories", void 0);
exports.SousFamille = SousFamille = __decorate([
    (0, typeorm_1.Entity)()
], SousFamille);
//# sourceMappingURL=SousFamille.js.map