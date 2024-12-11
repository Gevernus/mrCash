export function init(entity) {
    const inputComponent = entity.getComponent('InputComponent');
    document.getElementById('back').addEventListener('click', () => {
        inputComponent.addInput("setView", { view: 'profile' });
    });
}

export function render(entity) {
}