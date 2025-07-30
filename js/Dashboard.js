document.addEventListener('DOMContentLoaded', function() {
    let articleToDelete = null;

    // Gestion du bouton avatar
    const avatarBtn = document.getElementById('change-avatar-btn');
    const avatarInput = document.getElementById('avatar-input');
    const avatarImg = document.getElementById('avatar-img');
    if (avatarBtn && avatarInput && avatarImg) {
        avatarBtn.addEventListener('click', () => avatarInput.click());
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    avatarImg.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Vérifie la présence de la modale
    const confirmationModal = document.getElementById('confirmation-modal');
    if (!confirmationModal) {
        console.error('Modale de confirmation non trouvée (#confirmation-modal)');
        return;
    }

    // Ouvre la modale quand on clique sur un bouton Supprimer
    document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            articleToDelete = btn.closest('.article-card');
            if (!articleToDelete) {
                console.error('Impossible de trouver .article-card pour ce bouton');
                return;
            }
            confirmationModal.classList.remove('hidden');
        });
    });

    // Ferme la modale (croix ou bouton Annuler)
    document.querySelectorAll('.close-button, .cancel-delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            confirmationModal.classList.add('hidden');
            articleToDelete = null;
        });
    });

    // Supprime l'article quand on confirme
    const confirmBtn = document.querySelector('.confirm-delete-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            if (articleToDelete) {
                articleToDelete.remove();
                articleToDelete = null;
            }
            confirmationModal.classList.add('hidden');
        });
    } else {
        console.error('Bouton .confirm-delete-btn non trouvé');
    }
});
