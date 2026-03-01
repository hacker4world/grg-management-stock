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
exports.Compte = void 0;
const typeorm_1 = require("typeorm");
const Chantier_1 = require("./Chantier");
let Compte = class Compte {
};
exports.Compte = Compte;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Compte.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Compte.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Compte.prototype, "prenom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Compte.prototype, "nom_utilisateur", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Compte.prototype, "motdepasse", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Compte.prototype, "confirme", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "" }),
    __metadata("design:type", String)
], Compte.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Chantier_1.Chantier, (chantier) => chantier.compte),
    __metadata("design:type", Array)
], Compte.prototype, "chantiers", void 0);
exports.Compte = Compte = __decorate([
    (0, typeorm_1.Entity)()
], Compte);
//# sourceMappingURL=Compte.js.map