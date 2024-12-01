"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Monster_1 = require("../models/Monster");
const UserMonster_1 = require("../models/UserMonster");
const config_1 = require("../config/config");
const router = (0, express_1.Router)();
function calculateMonsterPrice(monster, userMonster) {
    const { basePrice, incomePerLevel } = config_1.config.cardConfigs[monster.rarity];
    const level = userMonster ? userMonster.level : 0;
    return basePrice + (level * incomePerLevel);
}
router.get('/:userId/monsters', async (req, res) => {
    try {
        const userId = req.params.userId;
        const monsters = await Monster_1.Monster.createQueryBuilder("monster")
            .leftJoinAndSelect("monster.userMonsters", "userMonster", "userMonster.user_id = :userId", { userId })
            .getMany();
        if (monsters.length > 0) {
            // Add price to each monster and sort
            const monstersWithPrice = monsters.map(monster => (Object.assign(Object.assign({}, monster), { price: calculateMonsterPrice(monster, monster.userMonsters[0]) })));
            monstersWithPrice.sort((a, b) => a.price - b.price);
            res.json(monstersWithPrice);
        }
        else {
            res.status(404).json({ error: 'No monsters found for this user' });
        }
    }
    catch (error) {
        console.error('Error fetching monsters:', error);
        res.status(500).json({ error: 'An error occurred while fetching monsters' });
    }
});
router.post('/:userId/monsters/upgrade/:monsterId', async (req, res) => {
    const userId = req.params.userId;
    const monsterId = parseInt(req.params.monsterId);
    try {
        let userMonster = await UserMonster_1.UserMonster
            .createQueryBuilder("userMonster")
            .innerJoinAndSelect("userMonster.monster", "monster")
            .where("userMonster.user_id = :userId")
            .andWhere("userMonster.monster_id = :monsterId")
            .setParameters({ userId, monsterId })
            .getOne();
        if (!userMonster) {
            const monster = await Monster_1.Monster.findOne({ where: { id: monsterId } });
            if (!monster) {
                console.log(`Monster not found for monsterId: ${monsterId}`);
                return res.status(404).json({ error: 'Monster not found' });
            }
            userMonster = UserMonster_1.UserMonster.create();
            userMonster.user_id = userId;
            userMonster.monster_id = monster.id;
            userMonster.level = 0;
            userMonster.monster = monster;
            console.log(`Created new UserMonster: ${JSON.stringify(userMonster)}`);
        }
        if (userMonster) {
            userMonster.level += 1;
            await userMonster.save();
            console.log(`Upgraded UserMonster: ${JSON.stringify(userMonster)}`);
            res.status(200).json({ message: 'Monster upgraded successfully', userMonster });
        }
        else {
            console.log(`UserMonster not found for userId: ${userId} and monsterId: ${monsterId}`);
            res.status(404).json({ error: 'UserMonster not found' });
        }
    }
    catch (error) {
        console.error('Error of upgrading a monster:', error);
        res.status(500).json({ error: 'Error of upgrading a monster' });
    }
});
exports.default = router;
//# sourceMappingURL=monster.js.map