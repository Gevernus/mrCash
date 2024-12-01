"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
exports.config = {
    initialEnergy: 500,
    initialPassiveIncome: 1,
    appURL: process.env.TELEGRAM_APP_LINK || "",
    levels: [
        'Novice Soul',
        'Seeker Soul',
        'Traveler Soul',
        'Adept Soul',
        'Sage Soul',
        'Guardian Soul',
        'Ascended Soul'
    ],
    levelRequirements: [
        0,
        100000,
        1000000,
        10000000,
        50000000,
        250000000,
        1000000000
    ],
    images: [
        'background.webp',
        'background.webp',
        'background.webp',
        'background.webp',
        'background.webp',
        'background.webp',
        'background.webp'
    ],
    cardConfigs: {
        ["Common"]: {
            basePrice: 50,
            incomePerLevel: 15
        },
        ["UnCommon"]: {
            basePrice: 70,
            incomePerLevel: 20
        },
        ["Rare"]: {
            basePrice: 200,
            incomePerLevel: 50
        },
        ["Very rare"]: {
            basePrice: 500,
            incomePerLevel: 200
        },
        ["Epic"]: {
            basePrice: 5000,
            incomePerLevel: 1000
        },
        ["Legendary"]: {
            basePrice: 20000,
            incomePerLevel: 5000
        },
        ["Haven"]: {
            basePrice: 100000,
            incomePerLevel: 15000
        }
    }
};
exports.default = exports.config;
//# sourceMappingURL=config.js.map