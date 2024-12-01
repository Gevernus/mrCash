"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const Referral_1 = require("../models/Referral");
const State_1 = require("../models/State");
const dotenv_1 = __importDefault(require("dotenv"));
const ShopItem_1 = require("../models/ShopItem");
const Monster_1 = require("../models/Monster");
const UserMonster_1 = require("../models/UserMonster");
const UserItem_1 = require("../models/UserItem");
const UserTask_1 = require("../models/UserTask");
const Task_1 = require("../models/Task");
const PackItem_1 = require("../models/PackItem");
const EventParam_1 = require("../models/EventParam");
const Event_1 = require("../models/Event");
const Skin_1 = require("../models/Skin");
const UserSkin_1 = require("../models/UserSkin");
// Load environment variables from .env file
dotenv_1.default.config();
const dbConfig = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User_1.User, Referral_1.Referral, State_1.State, UserItem_1.UserItem, ShopItem_1.ShopItem, Monster_1.Monster, UserMonster_1.UserMonster, Task_1.Task, UserTask_1.UserTask, PackItem_1.PackItem, Event_1.Event, EventParam_1.EventParam, Skin_1.Skin, UserSkin_1.UserSkin],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development'
};
exports.default = dbConfig;
//# sourceMappingURL=database.js.map