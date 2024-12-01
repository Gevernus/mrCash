import { ClickSystem, PassiveIncomeSystem, LevelUpSystem, StorageSystem, TelegramSystem, UISystem, EnergySystem, PopupSystem, SoulLevelSystem, ActionsSystem } from './systems.js';
import { SystemManager } from './systemManager.js';
import { Entity } from './ecs.js';
import { CoinsComponent, ClickPowerComponent, EnergyComponent, ConfigComponent, LevelComponent, PassiveIncomeComponent, InputComponent, ReferralsComponent, MonstersComponent, UserComponent, PacksComponent, RatingsComponent, TasksComponent, InventoryComponent, WildBonusComponent, WinBonusComponent, SkinsComponent } from './components.js';

let lastTime = 0;
const targetFPS = 60;
const timeStep = 1000 / targetFPS;

const systemManager = new SystemManager();

async function initApp() {
    // eruda.init();
    console.log('Trying to init app')
    const gameEntity = new Entity();
    const inputComponent = new InputComponent();
    gameEntity.addComponent(inputComponent);
    const telegramSystem = new TelegramSystem(gameEntity);
    const uiSystem = new UISystem(gameEntity);
    systemManager.addSystem(uiSystem);

    // if (telegramSystem.getUserId() == 1) {
    //     console.log('Set default view');
    //     uiSystem.setView('default', 'main');
    //     hideLoadingScreen();
    //     return;
    // }
    const storageSystem = new StorageSystem(gameEntity, telegramSystem.getUser(), telegramSystem.getInviter());
    const state = await storageSystem.getState();
    const config = await storageSystem.getConfig();
    const user = await storageSystem.getUser();
    const monsters = await storageSystem.getMonsters();
    const referrals = await storageSystem.getReferrals();
    if (referrals && referrals.length > 0) {
        inputComponent.addInput("action", { name: "FriendInvited" });
    }
    const ratings = await storageSystem.getRatings();
    const tasks = await storageSystem.getTasks();
    const packs = await storageSystem.getPacks();
    const skins = await storageSystem.getSkins();
    const inventory = await storageSystem.getInventory();
    console.log(`Inventory`, inventory);
    const monsterComponent = new MonstersComponent(monsters, config);
    const referralsComponent = new ReferralsComponent(referrals);
    const ratingsComponent = new RatingsComponent(ratings);
    const tasksComponent = new TasksComponent(tasks);
    const inventoryComponent = new InventoryComponent(inventory);

    systemManager.addSystem(telegramSystem);
    systemManager.addSystem(storageSystem)

    gameEntity.addComponent(new CoinsComponent(state.coins));
    gameEntity.addComponent(new SkinsComponent(skins, state.currentBackSkin, state.currentTapSkin));
    gameEntity.addComponent(new ClickPowerComponent(inventoryComponent.items, monsterComponent.items));
    gameEntity.addComponent(new EnergyComponent(state.energy, state.max_energy, state.energy_restore, inventoryComponent.items, state.level));
    gameEntity.addComponent(new PassiveIncomeComponent(monsterComponent.items, inventoryComponent.items, referralsComponent.items));
    gameEntity.addComponent(new ConfigComponent(config));
    gameEntity.addComponent(new UserComponent(user));
    gameEntity.addComponent(new LevelComponent(state.level));
    gameEntity.addComponent(referralsComponent);
    gameEntity.addComponent(monsterComponent);
    gameEntity.addComponent(ratingsComponent);
    gameEntity.addComponent(tasksComponent);
    gameEntity.addComponent(new PacksComponent(packs));
    gameEntity.addComponent(new WildBonusComponent(inventoryComponent.items));
    gameEntity.addComponent(new WinBonusComponent(inventoryComponent.items));
    gameEntity.addComponent(inventoryComponent);

    storageSystem.setEntity(gameEntity);

    // Initialize systems
    systemManager.addSystem(new ClickSystem(gameEntity));
    systemManager.addSystem(new PassiveIncomeSystem(gameEntity));
    systemManager.addSystem(new LevelUpSystem(gameEntity));
    systemManager.addSystem(new SoulLevelSystem(gameEntity));
    systemManager.addSystem(new EnergySystem(gameEntity));
    systemManager.addSystem(new PopupSystem(gameEntity));
    systemManager.addSystem(new ActionsSystem(gameEntity));

    systemManager.initAll();

    let currentLink = document.querySelector('.active');

    document.querySelectorAll('.navigate').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentLink) {
                currentLink.classList.remove('active');
                const actItemSadow = currentLink.querySelector(".menu-item-act-shadov");
                const actItem = actItemSadow.querySelector(".menu-icon-act");
                const actIcon = currentLink.querySelector(".menu-icon");
                actItem.classList.remove("menu-item-act-show");
                actItemSadow.classList.remove("menu-item-act-shadov-show");
                actIcon.classList.remove("menu-icon-show");
            }

            // Add active class to the clicked link
            e.currentTarget.classList.add('active');
            // Update the currentLink
            currentLink = e.currentTarget;
            const actItemSadow = currentLink.querySelector(".menu-item-act-shadov");
            const actItem = actItemSadow.querySelector(".menu-icon-act");
            const actIcon = currentLink.querySelector(".menu-icon");
            actItem.classList.add("menu-item-act-show");
            actItemSadow.classList.add("menu-item-act-shadov-show");
            actIcon.classList.add("menu-icon-show");

            console.log('Nav link clicked');
            inputComponent.addInput("vibrate");
            inputComponent.addInput("setView", { view: e.currentTarget.dataset.page });
        });
    });

    console.log('App inited')
    await uiSystem.setView('home');

    // Hide loading screen after initialization
    hideLoadingScreen();

    requestAnimationFrame((currentTime) => {
        lastTime = currentTime;
        tick(currentTime);
    });
    console.log('Frame requested')
}

function tick(currentTime) {
    requestAnimationFrame(tick);

    // Calculate elapsed time
    const deltaTime = currentTime - lastTime;

    // If enough time has passed, update the game
    if (deltaTime >= timeStep) {
        lastTime = currentTime;
        systemManager.updateAll(deltaTime / 1000);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

window.addEventListener('load', initApp);