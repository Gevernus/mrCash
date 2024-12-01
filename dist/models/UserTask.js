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
exports.UserTask = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Task_1 = require("./Task");
let UserTask = class UserTask extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserTask.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.tasks),
    __metadata("design:type", User_1.User)
], UserTask.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Task_1.Task, task => task.userTasks),
    __metadata("design:type", Task_1.Task)
], UserTask.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 0 }),
    __metadata("design:type", Number)
], UserTask.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserTask.prototype, "completed", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserTask.prototype, "claimed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UserTask.prototype, "claimedAt", void 0);
UserTask = __decorate([
    (0, typeorm_1.Entity)()
], UserTask);
exports.UserTask = UserTask;
//# sourceMappingURL=UserTask.js.map