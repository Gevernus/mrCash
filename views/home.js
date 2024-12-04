const animationPool = [];
const poolSize = 15;
let animationContainer;
const colors = [
    'rgba(255, 215, 0, 0.7)',   // Gold
    'rgba(255, 223, 56, 0.7)',  // Goldenrod
    'rgba(255, 242, 0, 0.7)',   // Bright Yellow
    'rgba(255, 228, 181, 0.7)', // Light Gold
    'rgba(255, 250, 205, 0.7)', // Lemon Chiffon
    'rgba(255, 239, 0, 0.7)',   // Yellow Gold
    'rgba(255, 255, 153, 0.7)'  // Pale Yellow
];

export function init(entity) {
    const inputComponent = entity.getComponent('InputComponent');
    let tapButton = document.getElementById('home-tap');
    const configComponent = entity.getComponent('ConfigComponent');
    const levelComponent = entity.getComponent('LevelComponent');
    const energyComponent = entity.getComponent('EnergyComponent');
    const clickPowerComponent = entity.getComponent('ClickPowerComponent');
    const skinsComponent = entity.getComponent('SkinsComponent');
    const config = configComponent.config;
    initializeAnimationPool();
    if (tapButton) {
        tapButton.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            if (energyComponent.energy >= clickPowerComponent.power) {
                inputComponent.addInput("tap");
                showClickAnimation(event.clientX, event.clientY, clickPowerComponent.power, animateButton(tapButton));
            }
        });
    } else {
        console.error('Tap button or container not found');
    }
    // if (skinsComponent.currentBackSkin) {
    //     document.body.style.backgroundImage = `url(/images/skins/${skinsComponent.currentBackSkin.image})`;
    // } else {
    //     document.body.style.backgroundImage = `url(/images/${config.images[levelComponent.level - 1]})`;
    // }

    // if (skinsComponent.currentTapSkin) {
    //     tapButton.style.backgroundImage = `url(images/skins/${skinsComponent.currentTapSkin.image})`;
    // }
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

function animateButton(button) {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Apply the filter with the random color
    button.style.filter = `brightness(1.2) drop-shadow(0 0 10px ${randomColor})`;
    button.style.transform = 'scale(1.03)';

    setTimeout(() => {
        button.style.transform = '';
        button.style.filter = '';
    }, 100); // Duration of the animation
    return randomColor;
}

function initializeAnimationPool() {
    animationContainer = document.createElement('div');
    animationContainer.className = 'animation-container';
    animationContainer.style.position = 'absolute';
    animationContainer.style.top = '0';
    animationContainer.style.left = '0';
    animationContainer.style.pointerEvents = 'none'; // Ensure it doesn't interfere with clicks
    document.body.appendChild(animationContainer);

    for (let i = 0; i < poolSize; i++) {
        const animationElement = document.createElement('div');
        animationElement.className = 'click-animation';
        animationElement.style.display = 'none';
        animationContainer.appendChild(animationElement);
        animationPool.push(animationElement);
    }
}

function showClickAnimation(x, y, count, color) {
    if (!animationContainer) {
        initializeAnimationPool();
    }

    let animationElement = animationPool.find(el => el.style.display === 'none');
    if (!animationElement) {

        // If all elements are in use, reuse the oldest one
        animationElement = animationPool.shift();

        animationPool.push(animationElement);
    }

    const flyDistanceY = Math.random() * 200 + 100; // Random value between 100px and 300px for vertical movement
    const flyDistanceX = (Math.random() * 200 - 100); // Random value between -100px and 100px for horizontal movement

    animationElement.style.setProperty('--fly-distance-y', `${flyDistanceY}px`);
    animationElement.style.setProperty('--fly-distance-x', `${flyDistanceX}px`);

    animationElement.textContent = `+${count}`;
    animationElement.style.left = `${x}px`;
    animationElement.style.top = `${y}px`;
    animationElement.style.display = 'block';
    animationElement.style.backgroundColor = color;

    // Reset the animation
    animationElement.style.animation = 'none';
    animationElement.offsetHeight; // Trigger reflow
    animationElement.style.animation = null;

    const randomOffsetX = Math.random() * 40 - 20; // Random offset between -10 and 10 pixels
    animationElement.style.transform = `translateX(${randomOffsetX}px)`;

    animationElement.addEventListener('animationend', function onAnimationEnd() {
        animationElement.style.display = 'none';
        animationElement.removeEventListener('animationend', onAnimationEnd);
    });
}

export function render(entity) {
    const energyComponent = entity.getComponent("EnergyComponent");
    const coinsComponent = entity.getComponent("CoinsComponent");
    const passiveIncomeComponent = entity.getComponent("PassiveIncomeComponent");
    const clickPowerComponent = entity.getComponent('ClickPowerComponent');

    document.getElementById('energy-value').textContent = `${Math.floor(energyComponent.energy)}`;
    document.getElementById('energy-total').textContent = `${Math.floor(energyComponent.maxEnergy)}`;
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

    // document.body.style.backgroundSize = `cover`;
    // document.body.style.backgroundPosition = 'center';
};