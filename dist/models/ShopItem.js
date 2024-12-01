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
exports.ShopItem = void 0;
const typeorm_1 = require("typeorm");
const UserItem_1 = require("./UserItem");
let ShopItem = class ShopItem extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], ShopItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ShopItem.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ShopItem.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ShopItem.prototype, "rarity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ShopItem.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { default: 0 }),
    __metadata("design:type", Number)
], ShopItem.prototype, "passive_bonus", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { default: 0 }),
    __metadata("design:type", Number)
], ShopItem.prototype, "wild_bonus", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { default: 0 }),
    __metadata("design:type", Number)
], ShopItem.prototype, "win_bonus", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: true, default: 0 }),
    __metadata("design:type", Number)
], ShopItem.prototype, "tap_bonus", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: true, default: 0 }),
    __metadata("design:type", Number)
], ShopItem.prototype, "coins_bonus", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: true, default: 0 }),
    __metadata("design:type", Number)
], ShopItem.prototype, "energy_bonus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UserItem_1.UserItem, userItem => userItem.item),
    __metadata("design:type", Array)
], ShopItem.prototype, "userItems", void 0);
ShopItem = __decorate([
    (0, typeorm_1.Entity)()
], ShopItem);
exports.ShopItem = ShopItem;
//# sourceMappingURL=ShopItem.js.map