// Variables globales
let currentArticle = null;
let currentArticleId = null;

// Fonction pour récupérer l'ID de l'article depuis l'URL
function getArticleIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fonction pour récupérer l'article depuis l'API
async function fetchArticle() {
    try {
        const articleId = getArticleIdFromUrl();
        if (!articleId) {
            throw new Error('ID d\'article manquant dans l\'URL');
        }
        
        currentArticleId = articleId;
        
        const response = await fetch(`backend/api/get_article.php?id=${articleId}`);
        const data = await response.json();
        
        if (data.success) {
            currentArticle = data.article;
            displayArticle(data.article, data.comments);
        } else {
            throw new Error(data.error || 'Erreur lors du chargement de l\'article');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError(error.message);
    }
}

// Fonction pour afficher l'article
function displayArticle(article, comments) {
    // Masquer l'état de chargement
    document.getElementById('loadingState').style.display = 'none';
    
    // Afficher le contenu de l'article
    const articleContent = document.getElementById('articleContent');
    articleContent.style.display = 'block';
    
    // Générer complètement le HTML de l'article
    articleContent.innerHTML = generateArticleHTML(article, comments);
    
    // Ajouter les event listeners après la génération du HTML
    addEventListeners();
    
    // Mise à jour du titre de la page
    document.title = `${article.title} - BlogSphere`;
}

// Fonction pour générer le HTML complet de l'article
function generateArticleHTML(article, comments) {
    return `
        <div class="article-header">
            <h1>${article.title}</h1>
            <div class="article-meta">
                <div class="author-info">
                    <a href="userprofile.php?author=${encodeURIComponent(article.author.name)}">
                        <img src="${article.author.avatar}" alt="Photo de profil" class="author-avatar">
                    </a>
                    <div class="author-details">
                        <span class="author-name">${article.author.name}</span>
                        <time datetime="${article.datetime}">${article.created_at}</time>
                    </div>
                </div>
                <div class="article-stats">
                    <span class="stat-item">
                        <i class="fas fa-eye"></i> ${article.views} vues
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-heart"></i> ${article.likes_count} likes
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-comment"></i> ${article.comments_count} commentaires
                    </span>
                </div>
            </div>
            <img src="${article.cover_image}" alt="${article.title}" class="cover-image">
        </div>

        <div class="article-content">
            ${article.content}
        </div>

        <div class="article-actions">
            <button class="like-button" id="likeButton" data-article-id="${article.id}">
                <i class="${article.user_liked ? 'fas' : 'far'} fa-heart"></i>
                <span class="like-count">${article.likes_count}</span>
            </button>
            <div class="share-buttons">
                <button class="share-btn whatsapp" onclick="shareOnWhatsApp()">
                    <i class="fab fa-whatsapp"></i>
                </button>
                <button class="share-btn facebook" onclick="shareOnFacebook()">
                    <i class="fab fa-facebook"></i>
                </button>
                <button class="share-btn copy-link" onclick="copyLink()">
                    <i class="fas fa-link"></i>
                </button>
            </div>
            ${article.is_author ? `
                <div class="author-actions">
                    <button class="edit-btn" onclick="editArticle()">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="delete-btn" onclick="deleteArticle()">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            ` : ''}
        </div>

        <section class="comments-section">
            <h3>Commentaires (${article.comments_count})</h3>
            <div class="comments-list">
                ${generateCommentsHTML(comments)}
            </div>

            <form class="comment-form" id="commentForm">
                <textarea placeholder="Ajouter un commentaire..." required></textarea>
                <button type="submit">Publier</button>
            </form>
        </section>
    `;
}

// Fonction pour générer le HTML des commentaires
function generateCommentsHTML(comments) {
    if (comments.length === 0) {
        return '<p class="no-comments">Aucun commentaire pour le moment. Soyez le premier à commenter !</p>';
    }
    
    return comments.map(comment => `
        <div class="comment">
            <img src="${comment.author_avatar}" alt="Avatar" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${comment.author_name}</span>
                    <time datetime="${comment.datetime}">${comment.created_at}</time>
                </div>
                <p class="comment-text">${comment.content}</p>
            </div>
        </div>
    `).join('');
}

// Fonction pour ajouter les event listeners après la génération du HTML
function addEventListeners() {
    // Event listener pour le bouton like
    const likeButton = document.getElementById('likeButton');
    if (likeButton) {
        likeButton.addEventListener('click', toggleLike);
    }
    
    // Event listener pour le formulaire de commentaire
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', addComment);
    }
}

// Fonction pour mettre à jour le bouton de like après un like/unlike
function updateLikeButton(userLiked, likesCount) {
    const likeButton = document.getElementById('likeButton');
    const likeIcon = likeButton.querySelector('i');
    const likeCountSpan = likeButton.querySelector('.like-count');
    
    if (userLiked) {
        likeIcon.className = 'fas fa-heart';
        likeButton.classList.add('liked');
    } else {
        likeIcon.className = 'far fa-heart';
        likeButton.classList.remove('liked');
    }
    
    likeCountSpan.textContent = likesCount;
    
    // Mettre à jour aussi le compteur dans les stats
    const statsLikes = document.querySelector('.article-stats .stat-item:nth-child(2)');
    if (statsLikes) {
        statsLikes.innerHTML = `<i class="fas fa-heart"></i> ${likesCount} likes`;
    }
}

// Fonction pour gérer le like
async function toggleLike() {
    try {
        const response = await fetch('backend/api/toggle_like.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                article_id: currentArticleId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Mettre à jour l'interface
            updateLikeButton(data.user_liked, data.likes_count);
            
            // Animation de feedback
            const likeButton = document.getElementById('likeButton');
            likeButton.classList.add('pulse');
            setTimeout(() => likeButton.classList.remove('pulse'), 300);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erreur lors du like:', error);
        alert('Erreur lors du like: ' + error.message);
    }
}

// Fonction pour ajouter un commentaire
async function addComment(event) {
    event.preventDefault();
    
    const commentForm = event.target;
    const textarea = commentForm.querySelector('textarea');
    const commentText = textarea.value.trim();
    
    if (!commentText) {
        alert('Le commentaire ne peut pas être vide');
        return;
    }
    
    try {
        const response = await fetch('backend/api/add_comment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                article_id: currentArticleId,
                content: commentText,
            })
            
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Ajouter le nouveau commentaire à la liste
            const commentsList = document.querySelector('.comments-list');
            const noComments = commentsList.querySelector('.no-comments');
            if (noComments) {
                noComments.remove();
            }
            
            const newComment = `
                <div class="comment">
                    <img src="${data.comment.author_avatar}" alt="Avatar" class="comment-avatar">
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">${data.comment.author_name}</span>
                            <time datetime="${data.comment.datetime}">${data.comment.created_at}</time>
                        </div>
                        <p class="comment-text">${data.comment.content}</p>
                    </div>
                </div>
            `;
            
            commentsList.insertAdjacentHTML('afterbegin', newComment);
            
            // Mettre à jour les compteurs
            const commentsCountHeader = document.querySelector('.comments-section h3');
            if (commentsCountHeader) {
                commentsCountHeader.innerHTML = `Commentaires (${data.comments_count})`;
            }
            
            // Mettre à jour le compteur dans les stats
            const statsComments = document.querySelector('.article-stats .stat-item:nth-child(3)');
            if (statsComments) {
                statsComments.innerHTML = `<i class="fas fa-comment"></i> ${data.comments_count} commentaires`;
            }
            
            // Vider le champ de commentaire
            textarea.value = '';
            
            // Animation de feedback
            commentForm.classList.add('success');
            setTimeout(() => commentForm.classList.remove('success'), 1000);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        alert('Erreur lors de l\'ajout du commentaire: ' + error.message);
    }
}

// Fonction pour afficher une erreur
function showError(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

// Fonctions de partage
function shareOnWhatsApp() {
    if (!currentArticle) return;
    
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(currentArticle.title);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const button = document.querySelector('.copy-link');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('copied');
        }, 2000);
    });
}

// Fonctions pour les actions de l'auteur
function editArticle() {
    if (currentArticle) {
        window.location.href = `edition-article.php?id=${currentArticle.id}`;
    }
}

function deleteArticle() {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.')) {
        // TODO: Implémenter la suppression d'article
        alert('Fonctionnalité de suppression à implémenter');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    fetchArticle();
});

// Ajout de styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
    .loading-state {
        text-align: center;
        padding: 3rem 1rem;
    }
    
    .loading-state .spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #1a8917;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .error-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #e74c3c;
    }
    
    .error-state button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #1a8917;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .like-button.liked {
        color: #e74c3c;
    }
    
    .like-button.pulse {
        animation: pulse 0.3s ease-in-out;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .comment-form.success {
        animation: success 1s ease-in-out;
    }
    
    @keyframes success {
        0% { background-color: transparent; }
        50% { background-color: rgba(26, 137, 23, 0.1); }
        100% { background-color: transparent; }
    }
    
    .copy-link.copied {
        background-color: #27ae60 !important;
        color: white !important;
    }
    
    .no-comments {
        text-align: center;
        color: #6b6b6b;
        font-style: italic;
        padding: 2rem;
    }
    
    .article-stats {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .stat-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.9rem;
        color: #6b6b6b;
    }
`;
document.head.appendChild(style);
