import { System } from './ecs.js';
import { CoinsComponent, ClickPowerComponent, EnergyComponent, ViewComponent, InputComponent, PassiveIncomeComponent, MonstersComponent, ReferralsComponent, UserComponent, ConfigComponent, LevelComponent, TasksComponent, RatingsComponent, InventoryComponent, SkinsComponent } from './components.js';

export class ClickSystem extends System {
    update(deltaTime) {
        if (this.entity.hasComponent(InputComponent) &&
            this.entity.hasComponent(ClickPowerComponent) &&
            this.entity.hasComponent(CoinsComponent) &&
            this.entity.hasComponent(EnergyComponent)) {

            const inputComponent = this.entity.getComponent(InputComponent);
            const tapInputs = inputComponent.getAndRemoveInputs('tap');
            if (tapInputs) {
                const clickPower = this.entity.getComponent(ClickPowerComponent).power;
                const coinsComponent = this.entity.getComponent(CoinsComponent);
                const energyComponent = this.entity.getComponent(EnergyComponent);
                tapInputs.forEach(tapInput => {
                    if (energyComponent.energy >= 1) {
                        coinsComponent.amount += clickPower;
                        energyComponent.energy -= clickPower;
                        inputComponent.addInput("vibrate");
                    }
                });
            }
        }
    }
}

export class PassiveIncomeSystem extends System {
    async init() {
        try {
            const userComponent = this.entity.getComponent(UserComponent);
            const response = await fetch(`/api/${userComponent.user.id}/calculate_passive`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to save state');
            }
            const data = await response.json();
            console.log(`Data is:`, data);
            if (data.shouldShowPopup) {
                const inputComponent = this.entity.getComponent(InputComponent);
                const coinsComponent = this.entity.getComponent(CoinsComponent);

                const callback = function () {
                    coinsComponent.amount += data.passive_income;
                }
                const title = "Claim reward";
                const message = `You earn ${data.passive_income} coins`;
                inputComponent.addInput("showPopup", { title, message, callback });
            } else {
                console.log('Return less than a 5 minutes');
            }
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    update(deltaTime) {
        if (this.entity.hasComponent(CoinsComponent) && this.entity.hasComponent(PassiveIncomeComponent)) {
            let coins = this.entity.getComponent(CoinsComponent);
            let passiveIncome = this.entity.getComponent(PassiveIncomeComponent);
            coins.amount += passiveIncome.incomePerHour / 3600 * deltaTime;
        }
    }
}

export class EnergySystem extends System {
    async init() {
        try {
            const userComponent = this.entity.getComponent(UserComponent);
            const energyComponent = this.entity.getComponent(EnergyComponent);
            const response = await fetch(`/api/${userComponent.user.id}/calculate_passive`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to save state');
            }
            const data = await response.json();

            energyComponent.energy = Math.min(
                energyComponent.maxEnergy,
                energyComponent.energy + data.energyRestored
            );
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    update(deltaTime) {
        if (this.entity.hasComponent(EnergyComponent)) {
            let energyComponent = this.entity.getComponent(EnergyComponent);
            energyComponent.energy = Math.min(
                energyComponent.maxEnergy,
                energyComponent.energy + energyComponent.energyRestore * deltaTime
            );
        }
    }
}

export class LevelUpSystem extends System {
    async update(deltaTime) {
        const inputComponent = this.entity.getComponent(InputComponent);
        const monstersComponent = this.entity.getComponent(MonstersComponent);
        const userComponent = this.entity.getComponent(UserComponent);
        const coinsComponent = this.entity.getComponent(CoinsComponent);
        const passiveIncomeComponent = this.entity.getComponent(PassiveIncomeComponent);
        const referralsComponent = this.entity.getComponent(ReferralsComponent);
        const clickPowerComponent = this.entity.getComponent(ClickPowerComponent);
        const inventoryComponent = this.entity.getComponent(InventoryComponent);
        const upgradeInputs = inputComponent.getAndRemoveInputs('upgrade');
        upgradeInputs.forEach(async (upgrade) => {
            if (upgrade && upgrade.data) {
                coinsComponent.amount -= upgrade.data.price;
                const data = await this.processUpgrade(upgrade.data.monsterId, userComponent.user.id);
                this.entity.getComponent(InputComponent).addInput("action",
                    {
                        name: `shop_upgrade`,
                        item: data.userMonster.monster.name,
                        price: upgrade.data.price,
                        user: userComponent.user.id,
                        level: data.userMonster.level,
                    });
                monstersComponent.updateItem(data.userMonster);
                passiveIncomeComponent.calculate(monstersComponent.items, inventoryComponent.items, referralsComponent.items);
                clickPowerComponent.calculate(inventoryComponent.items, monstersComponent.items);
            }
        });

    }

    async processUpgrade(monsterId, userId) {
        try {
            const response = await fetch(`api/${userId}/monsters/upgrade/${monsterId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                json: monsterId,
            });

            if (!response.ok) {
                throw new Error('Failed to save state');
            }
            return response.json();
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }
}

export class TelegramSystem extends System {
    constructor(entity) {
        super(entity);
        this.user = null;
        this.initTelegram();
    }

    initTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            this.user = window.Telegram.WebApp.initDataUnsafe.user || { id: 1, first_name: 'Test', last_name: 'User', username: 'test' };
            if (!this.user.username) {
                this.user.username = this.user.id;
            }
            this.inviterId = window.Telegram.WebApp.initDataUnsafe.start_param;
            if (this.inviterId) {
                this.entity.getComponent(InputComponent).addInput("action",
                    {
                        name: `invite_accepted`,
                        iviter_id: this.inviterId,
                        user_id: this.user.id,
                        username: this.user.username
                    });
            }
            console.log(`App opened with start_param: ${this.inviterId}`);
            window.Telegram.WebApp.disableVerticalSwipes();
            window.Telegram.WebApp.expand();
            // Listen for viewport changes, which include app closure
            window.Telegram.WebApp.onEvent('viewportChanged', async () => {
                if (window.Telegram.WebApp.isExpanded === false) {
                    // The app is being closed
                    // await updateDataBeforeClose();
                }
            });

            console.log('Telegram user initialized:', this.user);
        } else {
            console.error('Telegram WebApp is not available');
        }
    }

    getUser() {
        return this.user;
    }

    getInviter() {
        return this.inviterId;
    }

    getUserId() {
        return this.user ? this.user.id : null;
    }

    getUserName() {
        return this.user ? this.user.username : null;
    }

    update() {
        const inputComponent = this.entity.getComponent(InputComponent);

        const link = inputComponent.getAndRemoveInputs('openInvoice');

        if (link && link.length > 0 && link[0].data) {
            window.Telegram.WebApp.openInvoice(link[0].data.url, link[0].data.callback);
        }

        const url = inputComponent.getAndRemoveInputs('openLink');
        if (url && url.length > 0 && url[0].data) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${url[0].data.url}`);
        }

        const vibrate = inputComponent.getAndRemoveInputs('vibrate');
        if (vibrate && vibrate.length > 0) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
    }
}

export class StorageSystem extends System {
    constructor(entity, tgUser, inviter) {
        super(entity);
        this.tgUser = tgUser;
        this.inviter = inviter;
        this.state = null;
        this.config = null;
        this.user = null;
        this.timeToSave = 5;
        this.timer = 0;
    }

    setEntity(entity) {
        this.entity = entity;
    }

    setState(state) {
        this.state = state;
    }

    async getState() {
        if (!this.state) {
            await this.loadState();
        }
        return this.state;
    }

    async getConfig() {
        if (!this.config) {
            await this.loadState();
        }
        return this.config;
    }

    async getUser() {
        if (!this.user) {
            await this.loadState();
        }
        return this.user;
    }

    async getMonsters() {
        console.log('Trying to get monsters')
        try {
            const response = await fetch(`api/${this.tgUser.id}/monsters`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed getting monsters');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed getting monsters:', error);
        }
    }

    async getPacks() {
        try {
            const response = await fetch(`api/packs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed getting Packs');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed getting Packs:', error);
        }
    }

    async getSkins() {
        try {
            const response = await fetch(`api/${this.tgUser.id}/skins`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed getting Skins');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed getting Skins:', error);
        }
    }

    async getInventory() {
        try {
            const response = await fetch(`api/${this.tgUser.id}/inventory`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed getting inventory');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting inventory:', error);
        }
    }

    async getReferrals() {
        try {
            const response = await fetch(`api/${this.tgUser.id}/referrals`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed getting referrals');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed getting referrals:', error);
        }
    }

    async getRatings() {
        try {
            const response = await fetch(`api/ratings`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed getting ratings');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed getting ratings:', error);
        }
    }

    async getTasks() {
        try {
            const response = await fetch(`api/${this.tgUser.id}/tasks`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed getting tasks');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed getting tasks:', error);
        }
    }

    async saveState() {
        if (!this.entity) {
            console.error('No entity provided to save state');
            return;
        }

        const coinsComponent = this.entity.getComponent(CoinsComponent);
        const clickPowerComponent = this.entity.getComponent(ClickPowerComponent);
        const energyComponent = this.entity.getComponent(EnergyComponent);
        const passiveIncomeComponent = this.entity.getComponent(PassiveIncomeComponent);
        const levelComponent = this.entity.getComponent(LevelComponent);
        const skinsComponent = this.entity.getComponent(SkinsComponent);

        if (!coinsComponent || !clickPowerComponent || !energyComponent) {
            console.error('Entity is missing required components for saving state');
            return;
        }


        this.state.coins = Math.floor(coinsComponent.amount);
        this.state.energy = Math.floor(energyComponent.energy);
        this.state.passive_income = passiveIncomeComponent.incomePerHour;
        this.state.maxEnergy = energyComponent.baseMaxEnergy;
        this.state.level = levelComponent.level;
        if (skinsComponent.currentBackSkin) {
            this.state.currentBackSkin = skinsComponent.currentBackSkin.id;
        }
        if (skinsComponent.currentTapSkin) {
            this.state.currentTapSkin = skinsComponent.currentTapSkin.id;
        }
        try {
            const response = await fetch('api/state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state),
            });

            if (!response.ok) {
                throw new Error('Failed to save state');
            }

            console.log('State saved successfully');
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    async loadState() {
        try {
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userData: this.tgUser, inviterId: this.inviter }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.state = data.state;
            this.user = data.user;
            this.config = data.config;
        } catch (error) {
            console.error('Error loading state:', error);
        }
    }

    async update(deltaTime) {
        this.timer += deltaTime;
        this.updateTimer += deltaTime;
        const inputComponent = this.entity.getComponent(InputComponent);
        const save = inputComponent.getAndRemoveInputs('save');
        if (this.timer >= this.timeToSave || save && save.length > 0) {
            this.timer = 0;
            this.saveState();
        }

        const updateRating = inputComponent.getAndRemoveInputs('updateRating');
        if (updateRating && updateRating.length > 0) {
            let ratingsComponent = this.entity.getComponent(RatingsComponent);
            const ratings = await this.getRatings();
            ratingsComponent.items = ratings;
        }
    }
}

export class UISystem extends System {
    constructor(entity) {
        super(entity);
        this.views = {};
        this.currentView = null;
    }

    async loadView(viewName) {
        if (!this.views[viewName]) {
            const view = new ViewComponent(viewName);
            await view.load(this.entity);
            this.views[viewName] = view;
        }
        return this.views[viewName];
    }

    async setView(viewName, container = 'content') {
        try {
            if (this.currentView) {
                this.currentView.clear(this.entity);
            }
            const view = await this.loadView(viewName);
            console.log("View is loaded: ", view);
            this.entity.getComponent(InputComponent).addInput("action", { name: `page_view`, page: viewName });
            this.entity.getComponent(InputComponent).addInput("action", { name: viewName });
            this.currentView = view;
            document.getElementById(container).innerHTML = view.template;
            view.init(this.entity);
        } catch (error) {
            console.error(`Error setting view ${viewName}:`, error);
        }
    }

    update() {
        const inputComponent = this.entity.getComponent('InputComponent');
        const setViewInput = inputComponent.getAndRemoveInputs('setView');

        if (setViewInput && setViewInput.length > 0 && setViewInput[0].data) {
            this.setView(setViewInput[0].data.view);
        }
        if (this.currentView) {
            this.currentView.render(this.entity);
        }
    }
}

export class SoulLevelSystem extends System {
    constructor(entity) {
        super(entity);
    }

    update() {
        const coinsComponent = this.entity.getComponent(CoinsComponent);
        const configComponent = this.entity.getComponent(ConfigComponent);
        const levelComponent = this.entity.getComponent(LevelComponent);
        const energyComponent = this.entity.getComponent(EnergyComponent);

        const coins = coinsComponent.amount;
        const levelRequirements = configComponent.config.levelRequirements;

        let newLevel = levelComponent.level;
        for (let i = levelRequirements.length - 1; i >= 0; i--) {
            if (coins >= levelRequirements[i]) {
                newLevel = i + 1; // Adding 1 because array is 0-indexed, but levels start at 1
                break;
            }
        }

        // Only update if the new level is higher than the current level
        if (newLevel > levelComponent.level) {
            this.entity.getComponent(InputComponent).addInput("action", { name: `level_up`, level: newLevel });
            levelComponent.setLevel(newLevel);
            energyComponent.setLevel(newLevel);
        }
    }
}

export class PopupSystem extends System {
    constructor(entity) {
        super(entity);
        this.entity = entity;
        this.popupElement = null;
        this.callback = null;
        // this.initPopup();
    }

    initPopup() {
        // Create popup HTML structure (same as before)
        const popupHTML = `
            <div id="popup" class="popup">
                <div class="popup-content">
                    <h2 id="popup-title"></h2>
                    <p id="popup-message"></p>
                    <button class="close-btn">Claim</button>
                </div>
            </div>
        `;

        // Add popup to the body
        document.body.insertAdjacentHTML('beforeend', popupHTML);

        // Get popup element
        this.popupElement = document.getElementById('popup');

        // Add event listener to close button
        const closeBtn = this.popupElement.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            this.popupElement.style.display = 'none';
            if (this.callback) {
                this.callback();
            }
        });
    }

    update(deltaTime) {
        const inputComponent = this.entity.getComponent('InputComponent');

        // Handle show popup input
        const showPopupInput = inputComponent.getAndRemoveInputs('showPopup');
        if (showPopupInput && showPopupInput.length > 0 && showPopupInput[0].data) {
            this.popupElement.style.display = 'flex';
            this.callback = showPopupInput[0].data.callback;
            document.getElementById('popup-title').textContent = showPopupInput[0].data.title;
            document.getElementById('popup-message').textContent = showPopupInput[0].data.message;
        }
    }
}

export class ActionsSystem extends System {
    constructor(entity) {
        super(entity);
    }

    async update(deltaTime) {
        const inputComponent = this.entity.getComponent(InputComponent);
        const tasksComponent = this.entity.getComponent(TasksComponent);
        const userComponent = this.entity.getComponent(UserComponent);

        // Handle show popup input
        const action = inputComponent.getAndRemoveInputs('action');
        if (action && action.length > 0 && action[0].data) {
            console.log(`Action captured: `, action);
            const actionName = action[0].data.name;
            // Track Google Analytics event
            this.trackActionEvent(actionName, userComponent.user.id, action[0].data);

            if (tasksComponent && tasksComponent.tasks) {
                const matchingTasks = this.findMatchingTasks(tasksComponent, actionName);
                const tasks = await this.updateTaskProgress(matchingTasks, userComponent.user.id);
                if (tasks) {
                    tasksComponent.tasks = tasks;
                }
            }
        }
    }

    trackActionEvent(actionName, userId, params = {}) {
        // Check if gtag is available
        if (typeof gtag === 'function') {
            gtag('event', actionName, params);
        } else {
            console.warn('Google Analytics not loaded. Unable to track event.');
        }

        const payload = {
            eventName: actionName,
            params: params,
            userId: userId,
        };

        fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).catch((error) => {
            console.error('Error sending event to backend:', error);
        });
    }

    findMatchingTasks(tasksComponent, actionName) {
        return tasksComponent.tasks.filter(task => task.task_targetAction == actionName);
    }

    async updateTaskProgress(tasks, userId) {
        let result = null;
        for (const task of tasks) {
            try {
                const response = await fetch(`/api/${userId}/tasks/${task.task_id}/progress`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error(`Failed to update progress for task ${task.task_id}`);
                }
                const data = await response.json();
                if (data) {
                    result = data;
                }

                return result;
            } catch (error) {
                console.error(`Error updating progress for task ${task.task_id}:`, error);
            }
        }
    }
}