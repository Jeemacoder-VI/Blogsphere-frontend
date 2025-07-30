document.addEventListener('DOMContentLoaded', function() {
    // Gestion du bouton Like
    const likeButton = document.getElementById('likeButton');
    const likeCount = likeButton.querySelector('.like-count');
    let isLiked = false;

    likeButton.addEventListener('click', function() {
        isLiked = !isLiked;
        const currentCount = parseInt(likeCount.textContent);
        
        if (isLiked) {
            likeCount.textContent = currentCount + 1;
            likeButton.classList.add('liked');
            likeButton.querySelector('i').classList.remove('far');
            likeButton.querySelector('i').classList.add('fas');
        } else {
            likeCount.textContent = currentCount - 1;
            likeButton.classList.remove('liked');
            likeButton.querySelector('i').classList.remove('fas');
            likeButton.querySelector('i').classList.add('far');
        }
    });

    // Gestion des boutons de partage
    const shareButtons = {
        whatsapp: document.querySelector('.share-btn.whatsapp'),
        facebook: document.querySelector('.share-btn.facebook'),
        copyLink: document.querySelector('.share-btn.copy-link')
    };

    shareButtons.whatsapp.addEventListener('click', function() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(document.querySelector('h1').textContent);
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    });

    shareButtons.facebook.addEventListener('click', function() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    });

    shareButtons.copyLink.addEventListener('click', function() {
        navigator.clipboard.writeText(window.location.href).then(function() {
            alert('Lien copié !');
        }).catch(function(err) {
            console.error('Erreur lors de la copie :', err);
        });
    });

    // Gestion du formulaire de commentaire
    const commentForm = document.querySelector('.comment-form');
    
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const textarea = this.querySelector('textarea');
        const commentText = textarea.value.trim();
        
        if (commentText) {
            // Création du nouveau commentaire
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            newComment.innerHTML = `
                <img src="assets/image.png" alt="Avatar" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">Utilisateur</span>
                        <time datetime="${new Date().toISOString()}">${new Date().toLocaleDateString()}</time>
                    </div>
                    <p class="comment-text">${commentText}</p>
                </div>
            `;
            
            // Ajout du commentaire à la liste
            document.querySelector('.comments-list').appendChild(newComment);
            
            // Réinitialisation du formulaire
            textarea.value = '';
        }
    });

    // Gestion des boutons d'édition et de suppression
    const editButton = document.querySelector('.edit-btn');
    const deleteButton = document.querySelector('.delete-btn');

    // Vérification si l'utilisateur est l'auteur (à implémenter selon votre logique d'authentification)
    const isAuthor = false; // À modifier selon votre logique

    if (!isAuthor) {
        document.querySelector('.author-actions').style.display = 'none';
    }

    deleteButton.addEventListener('click', function() {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            // Logique de suppression à implémenter
            console.log('Article supprimé');
        }
    });
});
