document.addEventListener('DOMContentLoaded', function () {
    const shortcutsBtn = document.getElementById('shortcutsBtn');
    const shortcutsHelp = document.getElementById('shortcuts-help');
    let isShortcutsVisible = false;

    // Gestionnaire pour le bouton de raccourcis
    shortcutsBtn.addEventListener('click', function () {
        isShortcutsVisible = !isShortcutsVisible;
        shortcutsHelp.classList.toggle('show');

        // Mise à jour du titre du bouton
        shortcutsBtn.title = isShortcutsVisible ? "Masquer les raccourcis" : "Afficher les raccourcis";
    });

    // Fermer avec Échap
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isShortcutsVisible) {
            isShortcutsVisible = false;
            shortcutsHelp.classList.remove('show');
            shortcutsBtn.title = "Afficher les raccourcis";
        }
    });

    // Fermer en cliquant en dehors
    document.addEventListener('click', function (e) {
        if (isShortcutsVisible && !shortcutsHelp.contains(e.target) && e.target !== shortcutsBtn) {
            isShortcutsVisible = false;
            shortcutsHelp.classList.remove('show');
            shortcutsBtn.title = "Afficher les raccourcis";
        }
    });
});



