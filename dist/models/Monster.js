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
exports.Monster = void 0;
const typeorm_1 = require("typeorm");
const UserMonster_1 = require("./UserMonster");
let Monster = class Monster extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Monster.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Monster.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Monster.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Monster.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Monster.prototype, "rarity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Monster.prototype, "effect", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Monster.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserMonster_1.UserMonster, userMonster => userMonster.monster),
    __metadata("design:type", Array)
], Monster.prototype, "userMonsters", void 0);
Monster = __decorate([
    (0, typeorm_1.Entity)()
], Monster);
exports.Monster = Monster;
//# sourceMappingURL=Monster.js.map