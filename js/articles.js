// Variables globales
let articles = [];
let currentSearch = "";
let currentSort = "date";
let isLoading = false;

// Fonction pour récupérer les articles depuis l'API
async function fetchArticles() {
    try {
        isLoading = true;
        showLoadingState();
        
        const response = await fetch('backend/api/get_articles.php');
        const data = await response.json();
        
        if (data.success) {
            articles = data.articles;
            renderArticles();
        } else {
            console.error('Erreur lors de la récupération des articles:', data.error);
            showErrorState('Erreur lors du chargement des articles');
        }
    } catch (error) {
        console.error('Erreur réseau:', error);
        showErrorState('Erreur de connexion au serveur');
    } finally {
        isLoading = false;
        hideLoadingState();
    }
}

// Fonction pour afficher l'état de chargement
function showLoadingState() {
    const grid = document.getElementById("articlesGrid");
    grid.innerHTML = `
        <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
            <div class="spinner"></div>
            <p>Chargement des articles...</p>
        </div>
    `;
}

// Fonction pour masquer l'état de chargement
function hideLoadingState() {
    const loadingState = document.querySelector('.loading-state');
    if (loadingState) {
        loadingState.remove();
    }
}

// Fonction pour afficher l'état d'erreur
function showErrorState(message) {
    const grid = document.getElementById("articlesGrid");
    grid.innerHTML = `
        <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #e74c3c;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>${message}</p>
            <button onclick="fetchArticles()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Réessayer
            </button>
        </div>
    `;
}

// Fonction pour filtrer et trier les articles
function filterAndSortArticles() {
    let filtered = articles.filter(article => {
        const searchMatch = article.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                           article.desc.toLowerCase().includes(currentSearch.toLowerCase()) ||
                           article.author.toLowerCase().includes(currentSearch.toLowerCase());
        return searchMatch;
    });

    // Tri des articles
    switch (currentSort) {
        case 'popularity':
            filtered.sort((a, b) => b.popularity_score - a.popularity_score);
            break;
        case 'author':
            filtered.sort((a, b) => a.author.localeCompare(b.author));
            break;
        case 'date':
        default:
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
    }

    return filtered;
}

// Fonction pour afficher les articles
function renderArticles() {
    const grid = document.getElementById("articlesGrid");
    const filtered = filterAndSortArticles();
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6B6B6B;">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Aucun article trouvé.</p>
                ${currentSearch ? '<p>Essayez de modifier vos critères de recherche.</p>' : ''}
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(article => `
        <article class="article-card">
            <img src="${article.cover}" alt="Image de couverture" class="card-cover">
            <div class="card-content">
                <h3 class="card-title"><a href="${article.link}">${article.title}</a></h3>
                <p class="card-desc">${article.desc}</p>
                <div class="card-meta">
                    <img src="${article.avatar}" alt="Avatar" class="card-avatar">
                    <span class="card-author">${article.author}</span>
                    <span class="card-date">${article.date}</span>
                    <a href="userprofile.php?author=${encodeURIComponent(article.author)}"" class="profile"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                </div>
                <div class="card-stats">
                    <span class="stat-item" title="Vues">
                        <i class="fas fa-eye"></i> ${article.views}
                    </span>
                    <span class="stat-item" title="Likes">
                        <i class="fas fa-heart"></i> ${article.likes_count}
                    </span>
                    <span class="stat-item" title="Commentaires">
                        <i class="fas fa-comment"></i> ${article.comments_count}
                    </span>
                </div>
            </div>
        </article>
    `).join('');
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    fetchArticles();

    // Gestion de la recherche
    const searchForm = document.querySelector(".search-bar");
    const searchInput = document.getElementById("searchInput");
    
    searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        currentSearch = searchInput.value;
        renderArticles();
    });
    
    searchInput.addEventListener("input", function () {
        currentSearch = this.value;
        renderArticles();
    });

    // Gestion du tri
    const sortSelect = document.getElementById("sortSelect");
    sortSelect.addEventListener("change", function() {
        currentSort = this.value;
        renderArticles();
    });
});


