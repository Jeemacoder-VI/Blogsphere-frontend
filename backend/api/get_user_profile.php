<?php
require_once __DIR__ . '/../config/config.php';

header('Content-Type: application/json');

// Vérifie si l’auteur est spécifié dans l’URL
if (!isset($_GET['author']) || empty(trim($_GET['author']))) {
    echo json_encode(['success' => false, 'error' => 'Auteur non spécifié']);
    exit;
}

$author = sanitize($_GET['author']);

try {
    $pdo = getPDO();

    // Récupération de l'utilisateur
    $stmt = $pdo->prepare("SELECT id, username, bio, avatar FROM users WHERE username = ?");
    $stmt->execute([$author]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'Utilisateur non trouvé']);
        exit;
    }

    // Récupération des articles
    $stmt = $pdo->prepare("SELECT id, title FROM articles WHERE user_id = ? AND is_draft = 0 ORDER BY created_at DESC");
    $stmt->execute([$user['id']]);
    $articles = $stmt->fetchAll();

    foreach ($articles as &$article) {
        $article['link'] = "article.php?id=" . $article['id'];
    }

    echo json_encode([
        'success' => true,
        'user' => [
            'name' => $user['username'],
            'bio' => $user['bio'] ?: "Cet utilisateur n'a pas encore de biographie.",
            'avatar' => $user['avatar'] ?: "assets/default-avatar.png",
            'articles' => $articles
        ]
    ]);
} catch (Exception $e) {
    logError("Erreur dans get_user_profile.php", ['error' => $e->getMessage()]);
    echo json_encode(['success' => false, 'error' => 'Erreur serveur. Veuillez réessayer plus tard.']);
}
