export class SystemManager {
    constructor() {
        this.systems = new Map();
        this.systemsArray = []; // For maintaining order of system updates
    }

    addSystem(system) {
        const systemName = system.constructor.name;
        if (this.systems.has(systemName)) {
            console.warn(`System ${systemName} already exists. It will be replaced.`);
        }
        this.systems.set(systemName, system);
        this.systemsArray.push(system);
        console.log(`System ${systemName} added.`);
    }

    getSystem(systemName) {
        const system = this.systems.get(systemName);
        if (!system) {
            console.warn(`System ${systemName} not found.`);
            return null;
        }
        return system;
    }

    removeSystem(systemName) {
        const system = this.systems.get(systemName);
        if (system) {
            this.systems.delete(systemName);
            const index = this.systemsArray.indexOf(system);
            if (index > -1) {
                this.systemsArray.splice(index, 1);
            }
            console.log(`System ${systemName} removed.`);
        } else {
            console.warn(`System ${systemName} not found, cannot remove.`);
        }
    }

    updateAll(deltaTime) {
        for (const system of this.systemsArray) {
            if (typeof system.update === 'function') {
                system.update(deltaTime);
            }
        }
    }

    initAll() {
        for (const system of this.systemsArray) {
            if (typeof system.init === 'function') {
                system.init();
            }
        }
    }

    addEntityToAllSystems(entity) {
        for (const system of this.systemsArray) {
            if (typeof system.addEntity === 'function') {
                system.addEntity(entity);
            }
        }
    }

    removeEntityFromAllSystems(entity) {
        for (const system of this.systemsArray) {
            if (typeof system.removeEntity === 'function') {
                system.removeEntity(entity);
            }
        }
    }
}