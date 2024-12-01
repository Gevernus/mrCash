import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface CardConfig {
    basePrice: number;
    incomePerLevel: number;
}

type CardConfigs = {
    [key in string]: CardConfig;
};

interface GameConfig {
    initialEnergy: number;
    initialPassiveIncome: number;
    appURL: string;
    levels: string[];
    levelRequirements: number[];
    images: string[];
    cardConfigs: CardConfigs;
}

export const config: GameConfig = {
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

export default config;