export function init(entity) {
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