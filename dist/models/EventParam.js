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
exports.EventParam = void 0;
const typeorm_1 = require("typeorm");
const Event_1 = require("./Event");
let EventParam = class EventParam extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EventParam.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EventParam.prototype, "paramName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EventParam.prototype, "paramValue", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Event_1.Event, (event) => event.params, { onDelete: 'CASCADE' }),
    __metadata("design:type", Event_1.Event)
], EventParam.prototype, "event", void 0);
EventParam = __decorate([
    (0, typeorm_1.Entity)()
], EventParam);
exports.EventParam = EventParam;
//# sourceMappingURL=EventParam.js.map