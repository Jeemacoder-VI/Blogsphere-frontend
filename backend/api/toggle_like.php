<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
session_start();
require_once '../config/config.php';

// Vérification de la session utilisateur
if (!isLoggedIn()) {
    echo json_encode([
        'success' => false,
        'error' => 'Utilisateur non connecté'
    ]);
    exit;
}

try {
    $pdo = getPDO();
    
    // Récupération des données POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['article_id']) || !is_numeric($input['article_id'])) {
        throw new Exception('ID d\'article invalide');
    }
    
    $articleId = (int)$input['article_id'];
    $userId = $_SESSION['user_id'];
    
    // Vérification si l'article existe
    $articleCheck = "SELECT id FROM articles WHERE id = ? AND is_draft = 0";
    $stmt = $pdo->prepare($articleCheck);
    $stmt->execute([$articleId]);
    
    if (!$stmt->fetch()) {
        throw new Exception('Article non trouvé');
    }
    
    // Vérification si l'utilisateur a déjà liké cet article
    $likeCheck = "SELECT id FROM likes WHERE user_id = ? AND article_id = ?";
    $stmt = $pdo->prepare($likeCheck);
    $stmt->execute([$userId, $articleId]);
    $existingLike = $stmt->fetch();
    
    if ($existingLike) {
        // Suppression du like
        $deleteLike = "DELETE FROM likes WHERE user_id = ? AND article_id = ?";
        $stmt = $pdo->prepare($deleteLike);
        $stmt->execute([$userId, $articleId]);
        
        $action = 'unliked';
    } else {
        // Ajout du like
        $addLike = "INSERT INTO likes (user_id, article_id) VALUES (?, ?)";
        $stmt = $pdo->prepare($addLike);
        $stmt->execute([$userId, $articleId]);
        
        $action = 'liked';
    }
    
    // Récupération du nouveau nombre de likes
    $countLikes = "SELECT COUNT(*) as count FROM likes WHERE article_id = ?";
    $stmt = $pdo->prepare($countLikes);
    $stmt->execute([$articleId]);
    $likesCount = $stmt->fetch()['count'];
    
    echo json_encode([
        'success' => true,
        'action' => $action,
        'likes_count' => $likesCount,
        'user_liked' => $action === 'liked'
    ]);
    
} catch (Exception $e) {
    error_log("Erreur lors du toggle like: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 