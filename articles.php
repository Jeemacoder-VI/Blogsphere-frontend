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
    <title>Blogsphere - Tous les articles</title>
    <link rel="stylesheet" href="css/articles.css">
    <link rel="stylesheet" href="css/cards.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
     <nav class="navbar">
        <div class="logo">BlogSphere</div>
        <!-- <input type="search" placeholder="Rechercher des articles..."> -->
        <div class="nav-icons">
           <div class="write-icon">
            <a href="edition-article.php" title="Écrire un article">
            <i class="fas fa-pen"></i>
            </a>
       </div>

            <div class="notif-icon">
                <i class="fas fa-bell" title="Notifications"></i>
            </div>
             <a href="Dashboard.php">
              <div class="user-profile-icon" title="Mon profil">
              <i class="fas fa-user"></i>
              </div>
             </a>

            </div>
    </nav>

    <div class="pub-espace">
        <marquee behavior="" direction="">
            <h3><span>-10%</span> : Rejoignez-nous dès maintenant et découvrez des milliers d'articles passionnants</h3>
        </marquee>
    </div>

    <main class="main">
        <section class="articles-header">
            <h1>Articles du blog</h1>
            <form class="search-bar">
                <input type="text" placeholder="Rechercher un article..." id="searchInput">
            </form>
            <div class="filters-container">
                <div class="sort-filter">
                    <select id="sortSelect" class="sort-select">
                        <option value="date">Trier par date</option>
                        <option value="popularity">Trier par popularité</option>
                        <option value="author">Trier par auteur</option>
                    </select>
                </div>
            </div>
        </section>

        <section class="articles-list">
            <div class="articles-grid" id="articlesGrid">
                <!-- Les cartes d'articles seront générées par JS -->
            </div>
        </section>
    </main>

    <script src="js/articles.js"></script>
</body>
</html>
