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
    
    if (!isset($input['content']) || empty(trim($input['content']))) {
        throw new Exception('Le contenu du commentaire ne peut pas être vide');
    }
    
    $articleId = (int)$input['article_id'];
    $content = sanitize($input['content']);
    $userId = $_SESSION['user_id'];
    
    // Vérification si l'article existe
    $articleCheck = "SELECT id FROM articles WHERE id = ? AND is_draft = 0";
    $stmt = $pdo->prepare($articleCheck);
    $stmt->execute([$articleId]);
    
    if (!$stmt->fetch()) {
        throw new Exception('Article non trouvé');
    }
    
    // Ajout du commentaire
    $addComment = "INSERT INTO comments (user_id, article_id, content) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($addComment);
    $stmt->execute([$userId, $articleId, $content]);
    
    $commentId = $pdo->lastInsertId();
    
    // Récupération du commentaire avec les informations de l'utilisateur
    $getComment = "
        SELECT 
            c.id,
            c.content,
            c.created_at,
            u.username as author_name,
            u.avatar as author_avatar
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    ";
    
    $stmt = $pdo->prepare($getComment);
    $stmt->execute([$commentId]);
    $comment = $stmt->fetch();
    
    // Formatage du commentaire
    $date = new DateTime($comment['created_at']);
    $formattedComment = [
        'id' => $comment['id'],
        'content' => $comment['content'],
        'author_name' => $comment['author_name'],
        'author_avatar' => $comment['author_avatar'],
        'created_at' => $date->format('d M Y'),
        'datetime' => $comment['created_at']
    ];
    
    // Récupération du nouveau nombre de commentaires
    $countComments = "SELECT COUNT(*) as count FROM comments WHERE article_id = ?";
    $stmt = $pdo->prepare($countComments);
    $stmt->execute([$articleId]);
    $commentsCount = $stmt->fetch()['count'];
    
    echo json_encode([
        'success' => true,
        'comment' => $formattedComment,
        'comments_count' => $commentsCount
    ]);
    
} catch (Exception $e) {
    error_log("Erreur lors de l'ajout du commentaire: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 