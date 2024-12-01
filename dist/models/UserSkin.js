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
exports.UserSkin = void 0;
const typeorm_1 = require("typeorm");
const Skin_1 = require("./Skin");
let UserSkin = class UserSkin extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserSkin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserSkin.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserSkin.prototype, "skin_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Skin_1.Skin, skin => skin.id),
    (0, typeorm_1.JoinColumn)({ name: "skin_id" }),
    __metadata("design:type", Skin_1.Skin)
], UserSkin.prototype, "skin", void 0);
UserSkin = __decorate([
    (0, typeorm_1.Entity)()
], UserSkin);
exports.UserSkin = UserSkin;
//# sourceMappingURL=UserSkin.js.map