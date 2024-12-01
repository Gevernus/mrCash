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
}