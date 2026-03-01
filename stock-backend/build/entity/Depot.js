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
exports.Depot = void 0;
// entity/Depot.ts
const typeorm_1 = require("typeorm");
const Sortie_1 = require("./Sortie");
let Depot = class Depot {
};
exports.Depot = Depot;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Depot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Depot.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 500, nullable: true }),
    __metadata("design:type", String)
], Depot.prototype, "adresse", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Sortie_1.Sortie, (sortie) => sortie.depot),
    __metadata("design:type", Array)
], Depot.prototype, "sorties", void 0);
exports.Depot = Depot = __decorate([
    (0, typeorm_1.Entity)()
], Depot);
//# sourceMappingURL=Depot.js.map