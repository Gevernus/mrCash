export function init(entity) {
    const tabs = document.querySelectorAll('.profil-tab');
    const contents = document.querySelectorAll('[id^="profil-info-content"]');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('profil-tab-activ'));

            // Add active class to the clicked tab
            tab.classList.add('profil-tab-activ');

            // Hide all content sections
            contents.forEach(content => (content.style.display = 'none'));

            // Show the corresponding content based on the tab's data-id
            const contentId = tab.getAttribute('data-id');
            const contentToShow = document.getElementById(contentId);
            if (contentToShow) {
                contentToShow.style.display = 'flex';
            }
        });
    });
};

export function render(entity) {
}