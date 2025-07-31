<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: connexion.php');
    exit;
}

require_once './backend/classes/database.php';
require_once './backend/classes/user.php';

$user = new User();
$userData = $user->getUserById($_SESSION['user_id']);
$articles = $user->getUserArticles($_SESSION['user_id']);

$totalVues = 0;
$totalLikes = 0;
$nbPublies = 0;
$nbBrouillons = 0;

foreach ($articles as $article) {
    $totalVues += $article['views'];
    $totalLikes += $article['likes_count'];
    if ($article['is_draft']) {
        $nbBrouillons++;
    } else {
        $nbPublies++;
    }
}
?>

<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Utilisateur - BlogSphere</title>
    <link rel="stylesheet" href="./css/Dashboard.css">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.3/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 min-h-screen font-sans">
    <header class="main-header flex items-center justify-between px-8 py-6 bg-gradient-to-r from-cyan-700 to-blue-900 shadow-xl rounded-b-3xl mb-8">
        <div class="header-left">
            <a href="/" class="logo text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">BlogSphere</a>
        </div>
        <nav class="header-nav flex gap-6">
            <a href="accueil.html" class="nav-link text-white hover:text-cyan-300 transition">Retour à l'accueil</a>
            <a href="connexion.php" class="nav-link text-white hover:text-pink-400 transition">Déconnexion</a>
        </nav>
        <div class="user-profile-summary flex items-center gap-8 relative">
            <div class="relative flex items-center">
                <img src="photo.jpg" alt="Avatar utilisateur" class="profile-avatar rounded-full border-2 border-cyan-400 shadow-lg" id="avatar-img">
                <button id="change-avatar-btn" class="absolute bottom-0 right-0 bg-cyan-500 text-white rounded-full p-1 text-xs shadow-md hover:bg-cyan-700 transition">🖊️</button>
                <input type="file" id="avatar-input" accept="image/*" class="hidden">
            </div>
        </div>
    </header>

    <main class="dashboard-content max-w-5xl mx-auto">
        <section class="dashboard-overview mb-10">
            <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">Bonjour <span id="user-name-main"><?= htmlspecialchars($userData['username']) ?></span> 👋</h2>
            <p class="tagline text-cyan-200 mb-6">Gérez vos articles et suivez leurs performances.</p>
            <a href="edition-article.php" class="btn btn-primary create-article-btn bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg hover:scale-105 hover:shadow-green-400 transition-all px-6 py-2 rounded-full font-semibold">
                ➕ Créer un nouvel article
            </a>
        </section>

        <section class="user-articles mb-12">
            <h3 class="text-xl font-bold text-white mb-6">Mes Articles</h3>
            <div class="articles-list grid md:grid-cols-2 gap-8">
                <?php foreach ($articles as $article): ?>
                    <div class="article-card bg-gradient-to-r from-gray-800 via-blue-800 to-cyan-800 text-white rounded-xl shadow-xl p-6 hover:scale-105 transition-transform duration-300" data-id="<?= $article['id'] ?>">
                        <h4 class="article-title text-xl font-bold mb-2"><?= htmlspecialchars($article['title']) ?></h4>
                        <p class="article-date text-sm <?= $article['is_draft'] ? 'text-pink-200' : 'text-cyan-200' ?> mb-2">
                            <?= $article['is_draft'] ? 'Brouillon - Dernière modif. le ' : 'Publié le ' ?><?= date('d F Y', strtotime($article['created_at'])) ?>
                        </p>
                        <div class="article-stats flex gap-4 mb-4">
                            <span>📊 Vues: <?= $article['views'] ?></span>
                            <span>❤️ Likes: <?= $article['likes_count'] ?></span>
                        </div>
                        <div class="article-actions flex gap-2">
                            <a href="edition-article.php?id=<?= $article['id'] ?>" class="btn btn-secondary px-4 py-2 rounded-full bg-gray-800 text-white hover:bg-cyan-700 transition">✏️ Modifier</a>
                            <a href="supprimer-article.php?id=<?= $article['id'] ?>" class="btn btn-danger px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg hover:scale-105 transition">🗑️ Supprimer</a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </section>

        <section class="overall-stats mb-12">
            <h3 class="text-xl font-bold text-white mb-6">Statistiques Générales</h3>
            <div class="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6">
                <div class="stat-item bg-gray-900 bg-opacity-70 rounded-lg p-4 text-center shadow-lg">
                    <h4 class="text-cyan-400 font-bold mb-2">Total Vues</h4>
                    <p class="text-white text-2xl font-extrabold"><?= $totalVues ?></p>
                </div>
                <div class="stat-item bg-gray-900 bg-opacity-70 rounded-lg p-4 text-center shadow-lg">
                    <h4 class="text-pink-400 font-bold mb-2">Total Likes</h4>
                    <p class="text-white text-2xl font-extrabold"><?= $totalLikes ?></p>
                </div>
                <div class="stat-item bg-gray-900 bg-opacity-70 rounded-lg p-4 text-center shadow-lg">
                    <h4 class="text-blue-400 font-bold mb-2">Articles Publiés</h4>
                    <p class="text-white text-2xl font-extrabold"><?= $nbPublies ?></p>
                </div>
                <div class="stat-item bg-gray-900 bg-opacity-70 rounded-lg p-4 text-center shadow-lg">
                    <h4 class="text-cyan-200 font-bold mb-2">Brouillons</h4>
                    <p class="text-white text-2xl font-extrabold"><?= $nbBrouillons ?></p>
                </div>
            </div>
        </section>
    </main>

    <div id="confirmation-modal" class="modal fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 hidden">
        <div class="modal-content bg-gray-900 rounded-xl p-8 shadow-2xl relative w-full max-w-md">
            <span class="close-button absolute top-4 right-4 text-white text-2xl cursor-pointer">&times;</span>
            <h3 class="text-xl font-bold text-white mb-4">Confirmer la suppression</h3>
            <p class="text-cyan-200 mb-6">Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.</p>
            <div class="modal-actions flex gap-4 justify-end">
                <button class="btn btn-danger confirm-delete-btn px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg hover:scale-105 transition">Supprimer</button>
                <button class="btn btn-secondary cancel-delete-btn px-4 py-2 rounded-full bg-gray-800 text-white hover:bg-cyan-700 transition">Annuler</button>
            </div>
        </div>
    </div>

    <script src="Dashboard.js"></script>
</body>
</html>
