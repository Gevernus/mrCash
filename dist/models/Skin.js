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
exports.Skin = void 0;
const typeorm_1 = require("typeorm");
const UserSkin_1 = require("./UserSkin");
let Skin = class Skin extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Skin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Skin.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Skin.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Skin.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "coins" }),
    __metadata("design:type", String)
], Skin.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Skin.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserSkin_1.UserSkin, userSkin => userSkin.skin),
    __metadata("design:type", Array)
], Skin.prototype, "userSkins", void 0);
Skin = __decorate([
    (0, typeorm_1.Entity)()
], Skin);
exports.Skin = Skin;
//# sourceMappingURL=Skin.js.map