export function init(entity) {
    const inputComponent = entity.getComponent("InputComponent");
    let currentLink = document.querySelector('.active');
    document.querySelectorAll('.navigate').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentLink) {
                currentLink.classList.remove('active');
            }

            // Add active class to the clicked link
            e.currentTarget.classList.add('active');

            // Update the currentLink
            currentLink = e.currentTarget;
            console.log('Nav link clicked');
            inputComponent.addInput("vibrate");
            inputComponent.addInput("setView", { view: e.currentTarget.dataset.page });
        });
    });
};

export function render(entity) {
    const coinsComponent = entity.getComponent("CoinsComponent");
    const passiveIncomeComponent = entity.getComponent("PassiveIncomeComponent");
    const clickPowerComponent = entity.getComponent('ClickPowerComponent');
    
    document.getElementById('coins-value').textContent = Math.floor(coinsComponent.amount);
    let value = passiveIncomeComponent.incomePerHour;
    let measuredValue, measure;

    if (value < 1000) {
        measuredValue = value;
        measure = '';
    } else if (value >= 1000 && value < 1000000) {
        measuredValue = value / 1000;
        measure = 'K';
    } else {
        measuredValue = value / 1000000;
        measure = 'M';
    }

    document.getElementById('profit-hour-value').textContent = measuredValue.toFixed(1);
    document.getElementById('profit-hour-measure').textContent = measure;
    document.getElementById('profit-tap-value').textContent = clickPowerComponent.power;
}