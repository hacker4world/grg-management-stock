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
exports.Chantier = void 0;
// entity/Chantier.ts
const typeorm_1 = require("typeorm");
const Compte_1 = require("./Compte");
const Sortie_1 = require("./Sortie");
let Chantier = class Chantier {
};
exports.Chantier = Chantier;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Chantier.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Chantier.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Chantier.prototype, "adresse", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Compte_1.Compte, (compte) => compte.chantiers, {
        nullable: true,
        onDelete: "SET NULL",
    }),
    __metadata("design:type", Compte_1.Compte)
], Chantier.prototype, "compte", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Sortie_1.Sortie, (sortie) => sortie.chantier),
    __metadata("design:type", Array)
], Chantier.prototype, "sorties", void 0);
exports.Chantier = Chantier = __decorate([
    (0, typeorm_1.Entity)()
], Chantier);
//# sourceMappingURL=Chantier.js.map