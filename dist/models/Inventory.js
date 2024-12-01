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
exports.Inventory = void 0;
const typeorm_1 = require("typeorm");
const State_1 = require("./State");
let Inventory = class Inventory extends typeorm_1.BaseEntity {
    // Method to add an item to the inventory
    addItem(itemName, quantity = 1) {
        if (!this.items) {
            this.items = {};
        }
        this.items[itemName] = (this.items[itemName] || 0) + quantity;
    }
    // Method to remove an item from the inventory
    removeItem(itemName, quantity = 1) {
        if (this.items && this.items[itemName]) {
            this.items[itemName] -= quantity;
            if (this.items[itemName] <= 0) {
                delete this.items[itemName];
            }
        }
    }
    // Method to check if an item exists in the inventory
    hasItem(itemName) {
        return this.items && itemName in this.items;
    }
    // Method to get the quantity of an item
    getItemQuantity(itemName) {
        return this.items && this.items[itemName] ? this.items[itemName] : 0;
    }
    // Method to add an upgrade
    addUpgrade(upgradeName, level = 1) {
        if (!this.upgrades) {
            this.upgrades = {};
        }
        this.upgrades[upgradeName] = (this.upgrades[upgradeName] || 0) + level;
    }
    // Method to get upgrade level
    getUpgradeLevel(upgradeName) {
        return this.upgrades && this.upgrades[upgradeName] ? this.upgrades[upgradeName] : 0;
    }
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Inventory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => State_1.State),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", State_1.State)
], Inventory.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-json", { nullable: true }),
    __metadata("design:type", Object)
], Inventory.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-json", { nullable: true }),
    __metadata("design:type", Object)
], Inventory.prototype, "upgrades", void 0);
Inventory = __decorate([
    (0, typeorm_1.Entity)()
], Inventory);
exports.Inventory = Inventory;
//# sourceMappingURL=Inventory.js.map