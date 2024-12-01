import { Router } from 'express';
import { User } from '../models/User';
import config from '../config/config';
import { State } from '../models/State';
import { Task } from '../models/Task';
import { UserItem } from '../models/UserItem';
import { ShopItem } from '../models/ShopItem';
import { Skin } from '../models/Skin';
import { UserSkin } from '../models/UserSkin';
import { bot } from '../app';
import { Referral } from '../models/Referral';
import { UserTask } from '../models/UserTask';
import { LessThan } from 'typeorm';
import { PackItem } from '../models/PackItem';
import { Event } from '../models/Event';
import { EventParam } from '../models/EventParam';

const router = Router();

router.post('/user', async (req, res) => {
    const { userData, inviterId }: { userData: User, inviterId: string } = req.body;
    try {
        let user;
        let state: State | null;
        const result = await User.createQueryBuilder()
            .insert()
            .values(userData)
            .orIgnore()
            .returning("*")
            .execute();
        if (result.raw.length > 0) {
            user = result.raw[0];
            state = State.create();
            state.id = user.id;
            state.energy = config.initialEnergy;
            state.passive_income = config.initialPassiveIncome;

            if (inviterId && inviterId != user.id) {
                const referral = Referral.create();
                referral.inviterId = inviterId;
                referral.userId = user.id;
                referral.username = user.username;
                referral.bonus = 10;
                referral.status = 'accepted';
                await referral.save();
            }

            await state.save();
        } else {
            user = await User.findOne({ where: { id: userData.id } });
            state = await State.findOne({ where: { id: userData.id } });
        }
        console.log('User updated:', user);
        return res.status(200).json({ message: "User data saved successfully", user, state, config });
    } catch (error) {
        console.error(`Error saving user: ${userData}`, error);
        return res.status(500).json({ message: "Error saving user data" });
    }
});

router.get('/:userId/calculate_passive', async (req, res) => {
    const userId = req.params.userId;
    try {
        const state = await State.findOne({ where: { id: userId } })
        let passive_income = 0;
        let shouldShowPopup = false;
        let energyRestored = 0;
        if (state) {
            const now = new Date();
            const lastUpdated = new Date(state.last_updated);
            const timeDiffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
            const maxAccumulationTime = Math.min(timeDiffInSeconds, 3 * 60 * 60);
            passive_income = Math.floor(state.passive_income / 3600 * maxAccumulationTime);
            energyRestored = state.energy_restore * timeDiffInSeconds;
            shouldShowPopup = timeDiffInSeconds > 300 && passive_income > 0;
            console.log(`Time since last update in sec: ${timeDiffInSeconds}, should show popup: ${shouldShowPopup}`);
        }
        return res.status(200).json({ passive_income, shouldShowPopup, energyRestored });
    } catch (error) {
        console.error(`Error calculating of passive income for: ${userId}`, error);
        return res.status(500).json({ message: "Error calculating passive income" });
    }
});

router.post('/:userId/buy/', async (req, res) => {
    const userId = req.params.userId;
    const { items }: { items: ShopItem[] } = req.body;
    console.log('items', items);
    try {
        const userItems = [];
        for (const item of items) {
            const shopItem = await ShopItem.findOne({ where: { id: item.id } });
            if (shopItem) {
                const userItem = UserItem.create({
                    user_id: userId,
                    item_id: item.id,
                    item,
                })

                userItems.push(userItem);
            }
        }

        // Bulk save the created UserItems
        const savedUserItems = await UserItem.save(userItems);
        console.log('Successfully saved:', savedUserItems);
        return res.status(200).json({ items: savedUserItems });
    } catch (error) {
        console.error(`Error while saving items: ${userId}`, error);
        return res.status(500).json({ message: "Error while saving items" });
    }
});

router.post('/:userId/skin/', async (req, res) => {
    const userId = req.params.userId;
    const { skin }: { skin: Skin } = req.body;
    console.log('Skin', skin);
    try {
        const skinItem = await Skin.findOne({ where: { id: skin.id } });
        if (skinItem) {
            const userSkin = UserSkin.create();
            userSkin.user_id = userId;
            userSkin.skin_id = skinItem.id;
            userSkin.skin = skinItem;
            await userSkin.save();
            userSkin.skin = new Skin();
            skinItem.userSkins = [userSkin];
        }

        console.log('Successfully saved:', skinItem);
        return res.status(200).json({ skin: skinItem });
    } catch (error) {
        console.error(`Error while saving items: ${userId}`, error);
        return res.status(500).json({ message: "Error while saving items" });
    }
});

router.post('/:userId/skin/:skinId', async (req, res) => {
    const userId = req.params.userId;
    const skinId = parseInt(req.params.skinId);
    try {
        const skin = await Skin.findOne({ where: { id: skinId } });

        if (skin) {
            // If the currency is 'stars', create an invoice link
            if (skin.currency === 'stars') {
                const stringifiedPayload = JSON.stringify({ skin, userId });

                const invoiceLink = await bot.api.createInvoiceLink(
                    `Skin ${skin.name}`,
                    `Skin ${skin.name}`,
                    stringifiedPayload,
                    "",
                    "XTR",
                    [{ label: skin.name, amount: skin.price }],
                );

                return res.status(200).json({ invoiceLink, skin });
            } else {
                // If the currency is not 'stars', return the items directly
                return res.status(200).json({ skin });
            }
        } else {
            return res.status(400).json({ message: "Error while creating invoice" });
        }
    } catch (error) {
        console.error(`Error while creating invoice: ${userId}`, error);
        return res.status(500).json({ message: "Error while creating invoice" });
    }
});

router.post('/:userId/purchase/:packId', async (req, res) => {
    const userId = req.params.userId;
    const packId = req.params.packId;
    try {
        const state = await State.findOne({ where: { id: userId } });
        const pack = await PackItem.findOne({ where: { id: packId } });

        if (state && pack) {
            const randomItems = [];

            // Keep determining rarity and selecting items until we reach the count
            while (randomItems.length < pack.count) {
                const rarity = determineRarity(pack);

                const selectedItem = await ShopItem
                    .createQueryBuilder('shopItem')
                    .where('shopItem.rarity = :rarity', { rarity })
                    .orderBy('RANDOM()')
                    .getOne();

                if (selectedItem) {
                    randomItems.push(selectedItem);
                }
            }

            // If the currency is 'stars', create an invoice link
            if (pack.currency === 'stars') {
                const itemIds = randomItems.map(item => item.id);
                const stringifiedPayload = JSON.stringify({ itemIds, userId });

                const invoiceLink = await bot.api.createInvoiceLink(
                    `Pack of various items: ${pack.name}`,
                    'Pack of various items',
                    stringifiedPayload,
                    "",
                    "XTR",
                    [{ label: pack.name, amount: pack.price }],
                );

                return res.status(200).json({ invoiceLink, items: randomItems });
            } else {
                // If the currency is not 'stars', return the items directly
                return res.status(200).json({ items: randomItems });
            }
        } else {
            return res.status(400).json({ message: "Error while creating invoice" });
        }
    } catch (error) {
        console.error(`Error while creating invoice: ${userId}`, error);
        return res.status(500).json({ message: "Error while creating invoice" });
    }
});

function determineRarity(pack: PackItem): string {
    const random = Math.random() * 100; // Generate a random number between 0 and 100

    if (random <= pack.goldPercentage) {
        return 'gold';
    } else if (random <= pack.goldPercentage + pack.silverPercentage) {
        return 'silver';
    } else if (random <= pack.goldPercentage + pack.silverPercentage + pack.bronzePercentage) {
        return 'bronze';
    } else {
        return 'wood';
    }
}

router.get('/packs', async (req, res) => {
    try {
        const packs = await PackItem.find({
            order: {
                id: 'ASC'
            }
        });

        return res.status(200).json(packs);
    } catch (error) {
        console.error(`Error retrieving packs:`, error);
        return res.status(500).json({ message: "Error retrieving packs" });
    }
});

router.post('/state', async (req, res) => {
    const stateData: State = req.body;
    try {
        const state = await State.findOne({ where: { id: stateData.id } })
        if (state) {
            state.coins = stateData.coins;
            state.energy = stateData.energy;
            state.tap_power = stateData.tap_power;
            state.passive_income = stateData.passive_income;
            state.level = stateData.level;
            state.currentTapSkin = stateData.currentTapSkin;
            state.currentBackSkin = stateData.currentBackSkin;
            state.save();
        }
        return res.status(200).json({ message: "State data saved successfully" });
    } catch (error) {
        console.error(`Error saving user: ${stateData}`, error);
        return res.status(500).json({ message: "Error saving user data" });
    }
});

router.get('/:userId/inventory', async (req, res) => {
    try {
        const userId = req.params.userId;
        const userItems = await UserItem.createQueryBuilder("userItem")
            .innerJoinAndSelect("userItem.item", "item")
            .where("userItem.user_id = :userId", { userId })
            .getMany();

        if (userItems && userItems.length > 0) {
            const inventory = userItems.map(item => item.item);
            res.json(inventory);
        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Error fetching inventory' });
    }
});

router.get('/ratings', async (req, res) => {
    try {
        const ratings = await User
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.referrals", "referral")
            .leftJoinAndSelect("State", "userState", "userState.id = user.id")
            .leftJoinAndSelect("State", "referralState", "referralState.id = referral.userId")
            .select([
                "user.id AS user_id",
                "user.username AS user_username",
                "userState.coins AS coins",
                "userState.passive_income AS passive_income",
                "COUNT(referral.id) AS friendsCount",
                "SUM(DISTINCT COALESCE(referralState.passive_income, 0)) AS friendsPassiveIncome",
                "AVG(DISTINCT COALESCE(referralState.level, 1)) AS friendsAverageLevel",
            ])
            .groupBy("user.id, user.username, userState.coins, userState.passive_income")
            .getRawMany();

        res.status(200).json(ratings);

    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ error: 'Error fetching ratings' });
    }
});

router.get('/:userId/tasks', async (req, res) => {
    try {
        const userId = req.params.userId;
        await removeExpiredDailyTasks(userId);

        const tasks = await Task.createQueryBuilder('task')
            .leftJoinAndSelect('task.userTasks', 'userTask', 'userTask.user.id = :userId', { userId })
            .select([
                'task.id',
                'task.name',
                'task.description',
                'task.image',
                'task.targetAction',
                'task.requiredActionCount',
                'task.coins_bonus',
                'userTask.claimed as claimed',
                'userTask.completed as completed',
                'COALESCE(userTask.progress, 0) as progress'
            ])
            .addSelect('CASE WHEN task.requiredActionCount = 0 THEN 0 ELSE COALESCE(userTask.progress, 0) * 100.0 / task.requiredActionCount END', 'completionPercentage')
            .orderBy('task.id', 'ASC')
            .getRawMany();

        console.log(`Loaded tasks`, tasks);

        res.status(200).json(tasks);

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'An error occurred while fetching tasks' });
    }
});

router.post('/:userId/tasks/:taskId/progress', async (req, res) => {
    try {
        const userId = req.params.userId;
        const taskId = parseInt(req.params.taskId);

        let userTask = await UserTask.findOne({
            where: { user: { id: userId }, task: { id: taskId } },
            relations: ['task', 'user']  // Explicitly load the task and user relations
        });

        if (!userTask) {
            console.log(`Creating a task object: ${userId}:${taskId}`)
            const user = await User.findOne({ where: { id: userId } });
            const task = await Task.findOne({ where: { id: taskId } });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            userTask = UserTask.create();
            userTask.user = user;
            userTask.task = task;
            userTask.progress = 0;
            console.log(`User task created: ${userTask.id}`)
        }

        if (!userTask.completed) {
            userTask.progress += 1;
        }


        if (userTask.progress >= userTask.task.requiredActionCount) {
            userTask.completed = true;
        }

        // Save updated UserTask
        await userTask.save();

        const tasks = await Task.createQueryBuilder('task')
            .leftJoinAndSelect('task.userTasks', 'userTask', 'userTask.user.id = :userId', { userId })
            .select([
                'task.id',
                'task.name',
                'task.description',
                'task.image',
                'task.targetAction',
                'task.requiredActionCount',
                'task.coins_bonus',
                'userTask.claimed as claimed',
                'userTask.completed as completed',
                'COALESCE(userTask.progress, 0) as progress'
            ])
            .addSelect('CASE WHEN task.requiredActionCount = 0 THEN 0 ELSE COALESCE(userTask.progress, 0) * 100.0 / task.requiredActionCount END', 'completionPercentage')
            .orderBy('task.id', 'ASC')
            .getRawMany();

        res.status(200).json(tasks);

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'An error occurred while fetching tasks' });
    }
});

router.post('/events', async (req, res) => {
    const { eventName, params, userId } = req.body;

    try {
        const event = Event.create();
        event.eventName = eventName;
        event.userId = userId || null;

        if (params) {
            event.params = Object.entries(params).map(([key, value]) => {
                const param = EventParam.create();
                param.paramName = key;
                param.paramValue = String(value);
                return param;
            });
        }

        await event.save();
        return res.status(201).json({ message: 'Event saved successfully', eventId: event.id });
    } catch (error) {
        console.error('Error saving event:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/:userId/tasks/:taskId/claim', async (req, res) => {
    try {
        const userId = req.params.userId;
        const taskId = parseInt(req.params.taskId);

        let userTask = await UserTask.findOne({
            where: { user: { id: userId }, task: { id: taskId } },
            relations: ['task', 'user']  // Explicitly load the task and user relations
        });

        if (!userTask) {
            return res.status(404).json({ error: `UserTask not found: ${userId}:${taskId}` });
        }

        // Increment progress
        userTask.claimed = true;
        userTask.claimedAt = new Date();

        // Save updated UserTask
        await userTask.save();

        const tasks = await Task.createQueryBuilder('task')
            .leftJoinAndSelect('task.userTasks', 'userTask', 'userTask.user.id = :userId', { userId })
            .select([
                'task.id',
                'task.name',
                'task.description',
                'task.image',
                'task.targetAction',
                'task.requiredActionCount',
                'task.coins_bonus',
                'userTask.claimed as claimed',
                'userTask.completed as completed',
                'COALESCE(userTask.progress, 0) as progress'
            ])
            .addSelect('CASE WHEN task.requiredActionCount = 0 THEN 0 ELSE COALESCE(userTask.progress, 0) * 100.0 / task.requiredActionCount END', 'completionPercentage')
            .orderBy('task.id', 'ASC')
            .getRawMany();

        res.status(200).json({ tasks, reward: userTask.task.coins_bonus });

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'An error occurred while fetching tasks' });
    }
});

async function removeExpiredDailyTasks(userId: string) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const expiredDailyTasks = await UserTask.find({
        where: {
            user: { id: userId },
            task: { daily: true },
            claimed: true,
            claimedAt: LessThan(twentyFourHoursAgo)
        },
        relations: ['task']
    });

    for (const userTask of expiredDailyTasks) {
        await UserTask.remove(userTask);
    }
}

router.get('/:userId/skins', async (req, res) => {
    try {
        const userId = req.params.userId;
        const skins = await Skin.createQueryBuilder("skin")
            .leftJoinAndSelect("skin.userSkins", "userSkin", "userSkin.user_id = :userId", { userId })
            .orderBy("skin.price", "ASC")
            .getMany();

        if (skins.length > 0) {
            res.json(skins);
        } else {
            res.status(404).json({ error: 'No monsters found for this user' });
        }
    } catch (error) {
        console.error('Error fetching monsters:', error);
        res.status(500).json({ error: 'An error occurred while fetching monsters' });
    }
});

router.get('/:userId/buy/:skinId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const skinId = parseInt(req.params.skinId);
        const skin = await Skin.findOne({ where: { id: skinId } });

        if (!skin) {
            return res.status(404).json({ error: 'Skin not found' });
        }

        const userSkin = UserSkin.create();
        userSkin.user_id = userId;
        userSkin.skin = skin;

        // Save the UserSkin to the database
        await userSkin.save();
        userSkin.skin = new Skin();
        skin.userSkins = [userSkin];
        // Return the created UserSkin object
        return res.status(201).json(skin);

    } catch (error) {
        console.error('Error fetching monsters:', error);
        res.status(500).json({ error: 'An error occurred while fetching monsters' });
    }
});

export default router;