<?php
require_once __DIR__ . '/backend/config/config.php';
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// Vérifier si l'utilisateur est connecté
if (!isLoggedIn()) {
    redirect('connexion.php');
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Article - Blogsphere</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/article.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>


    <main class="article-container">
        <a href="articles.php" class="back-button">
            <i class="fas fa-arrow-left"></i> Retour aux articles
        </a>

        <div id="loadingState" class="loading-state">
            <div class="spinner"></div>
            <p>Chargement de l'article...</p>
        </div>

        <div id="errorState" class="error-state" style="display: none;">
            <i class="fas fa-exclamation-triangle"></i>
            <p id="errorMessage">Erreur lors du chargement de l'article</p>
            <button onclick="location.reload()">Réessayer</button>
        </div>

        <div id="articleContent" class="blog-article" style="display: none;">
            <div class="article-header">
                <h1 id="articleTitle"></h1>
                <div class="article-meta">
                    <div class="author-info">
                        <a id="authorLink" href="#"><img id="authorAvatar" src="assets/image.png" alt="Photo de profil" class="author-avatar"></a>
                        <div class="author-details">
                            <span id="authorName" class="author-name"></span>
                            <time id="articleDate" datetime=""></time>
                        </div>
                    </div>
                    <div class="article-stats">
                        <span class="stat-item">
                            <i class="fas fa-eye"></i> <span id="viewsCount">0</span> vues
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-heart"></i> <span id="likesCount">0</span> likes
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-comment"></i> <span id="commentsCount">0</span> commentaires
                        </span>
                    </div>
                </div>
                <img id="coverImage" src="assets/uxbg.jpg" alt="Image de couverture" class="cover-image">
            </div>

            <div class="article-content">
                <p>Créer une interface responsive moderne est essentiel pour offrir une expérience utilisateur optimale
                    sur tous les appareils. En 2025, les tendances privilégient la simplicité, la rapidité et
                    l’accessibilité. Utilisez des grilles CSS flexibles, des polices lisibles et des couleurs douces
                    pour capter l’attention sans surcharger l’écran.</p>

                <h2>Les étapes clés pour réussir</h2>
                <ul>
                    <li><strong>1. Utiliser Flexbox et Grid :</strong> Ces outils permettent de structurer facilement
                        vos pages et de les adapter à toutes les résolutions.</li>
                    <li><strong>2. Prioriser le mobile :</strong> Concevez d’abord pour les petits écrans, puis
                        enrichissez pour le desktop (approche mobile-first).</li>
                    <li><strong>3. Optimiser les images :</strong> Servez des images légères et adaptées à la taille de
                        l’écran pour accélérer le chargement.</li>
                    <li><strong>4. Tester l’accessibilité :</strong> Vérifiez la lisibilité, le contraste et la
                        navigation au clavier pour tous les utilisateurs.</li>
                </ul>
                <h2>Bonnes pratiques de design</h2>
                <p>Privilégiez les espaces blancs, les boutons arrondis et les animations douces pour rendre la
                    navigation agréable. Inspirez-vous des sites populaires et adaptez les tendances à votre identité
                    visuelle. N’oubliez pas d’intégrer des fonctionnalités interactives comme le mode sombre, les
                    notifications ou les transitions fluides.</p>
                <blockquote>“Un bon design, c’est celui qui se fait oublier et laisse place au contenu.”</blockquote>
            </div>

            <div class="article-actions">
                <button class="like-button" id="likeButton">
                    <i id="likeIcon" class="far fa-heart"></i>
                    <span id="likeCount" class="like-count">0</span>
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
                <div id="authorActions" class="author-actions" style="display: none;">
                    <button class="edit-btn" onclick="editArticle()">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="delete-btn" onclick="deleteArticle()">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>

            <section class="comments-section">
                <h3>Commentaires (<span id="commentsCountHeader">0</span>)</h3>
                <div id="commentsList" class="comments-list">
                    <!-- Les commentaires seront injectés dynamiquement -->
                </div>

                <form id="commentForm" class="comment-form">
                    <textarea id="commentText" placeholder="Ajouter un commentaire..." required></textarea>
                    <button type="submit">Publier</button>
                </form>
            </section>


        </div>
    </main>

    <footer id="pied">
        <ul class="bottom-links">
            <li><a href="#">Mentions légales</a></li>
            <li><a href="#">Politique de confidentialité</a></li>
            <li><a href="#">Conditions d'utilisation</a></li>
            <li><a href="#">Contact</a></li>
        </ul>
    </footer>

    <script src="js/article.js"></script>
</body>
</html>