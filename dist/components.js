export class CoinsComponent {
    constructor(amount = 0) {
        this.amount = amount;
    }
}

export class MeasureComponent {
    constructor() {
        this.startTime = null; 
    }

    // Start measuring time
    start() {
        this.startTime = performance.now();
    }

    // Get the elapsed time in milliseconds
    elapsedTime() {
        if (this.startTime === null) {
            throw new Error("Timer has not been started. Call start() before checking elapsed time.");
        }
        return performance.now() - this.startTime; // Return the difference
    }
}

export class ClickPowerComponent {
    constructor(items = [], monsters = []) {
        this.calculate(items, monsters);
    }

    calculate(items, monsters) {
        this.power = 1;
        for (const item of items) {
            this.power += item.tap_bonus;
        }

        for (const monster of monsters) {
            this.power += monster.incomePerClick;
        }
    }
}

export class LevelComponent {
    constructor(level = 1) {
        this.setLevel(level);
    }

    setLevel(level) {
        this.level = Math.min(Math.max(1, level), 7);
    }
}

export class EnergyComponent {
    constructor(energy = 500, maxEnergy = 500, energyRestore = 1, items = [], level) {
        this.energy = energy;
        this.baseMaxEnergy = maxEnergy * Math.pow(2, level);
        this.energyRestore = energyRestore;
        this.items = items;
        this.calculate(items);
    }

    setLevel(newLevel) {
        this.baseMaxEnergy = 500 * Math.pow(2, newLevel);
        this.calculate(this.items);
    }

    calculate(items) {
        this.maxEnergy = this.baseMaxEnergy;
        for (const item of items) {
            this.maxEnergy += item.energy_bonus;
        }
    }
}

export class WinBonusComponent {
    constructor(items = []) {
        this.bonus = 0;
        this.calculate(items);
    }

    calculate(items) {
        this.bonus = 0;
        for (const item of items) {
            this.boost += item.win_bonus;
        }
    }
}

export class WildBonusComponent {
    constructor(items = []) {
        this.bonus = 0;
        this.calculate(items);
    }

    calculate(items) {
        this.boost = 0;
        for (const item of items) {
            this.boost += item.wild_bonus;
        }
    }
}

export class PassiveIncomeComponent {
    constructor(monsters = [], items = [], referrals = []) {
        this.incomePerHour = 0;
        this.calculate(monsters, items, referrals);
    }

    calculate(monsters, items, referrals) {
        this.incomePerHour = 0;
        for (const monster of monsters) {
            this.incomePerHour += monster.incomePerHour;
        }

        for (const item of referrals) {
            this.incomePerHour += item.bonus;
        }

        const nonItemsIncome = this.incomePerHour;
        console.log(`Non item passive income: ${nonItemsIncome}`);
        for (const item of items) {
            this.incomePerHour += item.passive_bonus;
        }

        console.log(`Resulting income: ${this.incomePerHour}`);
    }
}

export class InventoryComponent {
    constructor(items = []) {
        this.items = items;
    }

    addItems(newItems) {
        this.items = [...this.items, ...newItems];
    }
}

export class ShopComponent {
    constructor(shopData = []) {
        this.shopData = shopData;
    }
}

class MonsterData {
    constructor(id, name, type, description, rarity, effect, image, level, incomePerLevel, basePrice) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.rarity = rarity;
        this.effect = effect;
        this.image = image;
        this.update(level, incomePerLevel, basePrice);
    }

    update(level, incomePerLevel, basePrice) {
        this.level = level;
        this.incomePerHour = incomePerLevel * level;
        this.incomePerHourNext = (incomePerLevel * (level + 1)) - this.incomePerHour;
        this.price = Math.round(basePrice * Math.pow(1.30, level));
        this.incomePerClick = level > 0 && this.type === 'tap' ? level : 0;
    }
}

export class PacksComponent {
    constructor(items) {
        this.items = items;
    }
}

export class SkinsComponent {
    constructor(items, currentBackSkin, currentTapSkin) {
        this.items = items;
        this.currentBackSkin = this.find(currentBackSkin);
        this.currentTapSkin = this.find(currentTapSkin);
    }

    select(skinId) {
        const item = this.items.find(i => i.id == skinId);
        if (item.type == "back") {
            this.currentBackSkin = item;
        } else {
            this.currentTapSkin = item;
        }
    }

    canSelect(skinId) {
        const index = this.items.findIndex(i => i.id == skinId);
        if (index !== -1) {
            const userSkins = this.items[index].userSkins;
            return userSkins && userSkins.length > 0;
        } else {
            console.error(`Item with the specified ID not found: ${skinId}`, this.items);
        }
        return false;
    }

    isSelected(skinId) {
        return this.currentBackSkin && this.currentBackSkin.id == skinId || this.currentTapSkin && this.currentTapSkin.id == skinId;
    }

    find(skinId) {
        if (!skinId) {
            return null;
        }
        return this.items.find(i => i.id == skinId);
    }

    replaceItem(item) {
        const index = this.items.findIndex(i => i.id == item.id);
        if (index !== -1) {
            this.items[index] = item;
        } else {
            console.error('Item with the specified ID not found');
        }
    }
}

export class ReferralsComponent {
    constructor(items) {
        this.items = items;

    }
}

export class RatingsComponent {
    constructor(items) {
        this.items = items;
    }
}

export class TasksComponent {
    constructor(tasks) {
        console.log(`Initialize tasks: `, tasks);
        this.tasks = tasks;
        this.items = tasks;
    }
}

export class MonstersComponent {
    constructor(data = [], config) {
        this.config = config;
        this.updateItems(data);
    }

    updateItems(data) {
        this.items = data.map(item => new MonsterData(
            item.id,
            item.name,
            item.type,
            item.description,
            item.rarity,
            item.effect,
            item.image,
            item.userMonsters[0] ? item.userMonsters[0].level : 0,
            this.config.cardConfigs[item.rarity].incomePerLevel,
            this.config.cardConfigs[item.rarity].basePrice,
        ));
    }

    updateItem(data) {
        this.items = this.items.map(existingItem => {
            if (existingItem.id == data.monster_id) {
                existingItem.update(data.level,
                    this.config.cardConfigs[data.monster.rarity].incomePerLevel,
                    this.config.cardConfigs[data.monster.rarity].basePrice);
            }
            return existingItem;
        });
    }

    getMonsterById(id) {
        return this.items.find(monster => monster.id == id);
    }
}

export class ConfigComponent {
    constructor(config) {
        this.config = config;
    }
}

export class UserComponent {
    constructor(user) {
        this.user = user;
    }
}

export class InputComponent {
    constructor() {
        this.inputQueue = [];
    }

    addInput(inputType, data = {}) {
        this.inputQueue.push({
            type: inputType,
            timestamp: Date.now(),
            data,
        });
    }

    getAndRemoveInputs(inputType) {
        const removedInputs = [];
        let i = 0;
        while (i < this.inputQueue.length) {
            if (this.inputQueue[i].type === inputType) {
                removedInputs.push(...this.inputQueue.splice(i, 1));
            } else {
                i++;
            }
        }
        return removedInputs;
    }

    hasInput(inputType) {
        return this.inputQueue.some(input => input.type === inputType);
    }
}

export class ViewComponent {
    constructor(name) {
        this.name = name;
        this.template = '';
        this.logic = null;
    }

    async load(entity) {
        try {
            console.log(`Start of view loading: ${entity.getComponent(MeasureComponent).elapsedTime()}`);
            // Load HTML template
            const [htmlResponse, logic] = await Promise.all([
                fetch(`/views/${this.name}.html`),
                import(`/views/${this.name}.js`)
            ]);

            // Check HTML response
            if (!htmlResponse.ok) {
                throw new Error(`Failed to load HTML for ${this.name}. Status: ${htmlResponse.status}`);
            }
            console.log(`Got response: ${entity.getComponent(MeasureComponent).elapsedTime()}`);
            this.template = await htmlResponse.text();
            console.log(`Text loaded: ${entity.getComponent(MeasureComponent).elapsedTime()}`);
            // Load JavaScript logic
            // const jsResponse = await fetch(`/views/${this.name}.js`);
            this.logic = logic;
            console.log(`Logic imported: ${entity.getComponent(MeasureComponent).elapsedTime()}`);
            if (typeof this.logic.init !== 'function' || typeof this.logic.render !== 'function') {
                throw new Error(`View ${this.name} must export init and render functions`, this.logic);
            }
        } catch (error) {
            console.error(`Error loading view ${this.name}:`, error);
        }
    }

    init(entity) {
        if (this.logic && typeof this.logic.init === 'function') {
            this.logic.init(entity);
        }
    }

    clear(entity) {
        if (this.logic && typeof this.logic.clear === 'function') {
            this.logic.clear(entity);
        }
    }

    render(entity) {
        if (this.logic && typeof this.logic.render === 'function') {
            this.logic.render(entity);
        }
    }
}