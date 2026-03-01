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
exports.Fabriquant = void 0;
const typeorm_1 = require("typeorm");
const Entree_1 = require("./Entree");
let Fabriquant = class Fabriquant {
};
exports.Fabriquant = Fabriquant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Fabriquant.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Fabriquant.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Fabriquant.prototype, "adresse", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Fabriquant.prototype, "contact", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Entree_1.Entree, (entree) => entree.fabriquant),
    __metadata("design:type", Array)
], Fabriquant.prototype, "entrees", void 0);
exports.Fabriquant = Fabriquant = __decorate([
    (0, typeorm_1.Entity)()
], Fabriquant);
//# sourceMappingURL=Fabriquant.js.map