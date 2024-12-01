export class Entity {
    constructor() {
        this.components = new Map();
        this.id = Entity.nextId++;
    }

    addComponent(component) {
        this.components.set(component.constructor.name, component);
    }

    removeComponent(componentClass) {
        const key = this.getComponentKey(componentClass);
        this.components.delete(key);
    }

    getComponent(componentClass) {
        const key = this.getComponentKey(componentClass);
        return this.components.get(key);
    }

    hasComponent(componentClass) {
        const key = this.getComponentKey(componentClass);
        return this.components.has(key);
    }

    getComponentKey(componentClass) {
        if (typeof componentClass === 'string') {
            return componentClass;
        } else if (typeof componentClass === 'function') {
            return componentClass.name;
        } else {
            throw new Error('Invalid component class type');
        }
    }
}

Entity.nextId = 0;

export class System {
    constructor(entity) {
        this.entity = entity;
    }

    // addEntity(entity) {
    //     this.entities.add(entity);
    // }

    // removeEntity(entity) {
    //     this.entities.delete(entity);
    // }

    update(deltaTime) {
        // Override this method in derived systems
    }
}