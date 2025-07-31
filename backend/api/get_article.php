<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/config.php';

try {
    $pdo = getPDO();
    
    // Vérification de l'ID de l'article
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        throw new Exception('ID d\'article invalide');
    }
    
    $articleId = (int)$_GET['id'];
    
    // Récupération de l'article avec les informations de l'auteur
    $query = "
        SELECT 
            a.id,
            a.title,
            a.content,
            a.views,
            a.created_at,
            a.updated_at,
            a.is_draft,
            u.id as user_id,
            u.username as author_name,
            u.avatar as author_avatar,
            u.bio as author_bio,
            ae.cover_image_url,
            COUNT(DISTINCT c.id) as comments_count,
            COUNT(DISTINCT l.id) as likes_count
        FROM articles a
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN article_editions ae ON a.id = ae.article_id
        LEFT JOIN comments c ON a.id = c.article_id
        LEFT JOIN likes l ON a.id = l.article_id
        WHERE a.id = ? AND a.is_draft = 0
        GROUP BY a.id, a.title, a.content, a.views, a.created_at, a.updated_at, a.is_draft, u.id, u.username, u.avatar, u.bio, ae.cover_image_url
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$articleId]);
    $article = $stmt->fetch();
    
    if (!$article) {
        throw new Exception('Article non trouvé');
    }
    
    // Incrémentation du compteur de vues
    $updateViews = "UPDATE articles SET views = views + 1 WHERE id = ?";
    $stmt = $pdo->prepare($updateViews);
    $stmt->execute([$articleId]);
    
    // Récupération des commentaires
    $commentsQuery = "
        SELECT 
            c.id,
            c.content,
            c.created_at,
            u.username as author_name,
            u.avatar as author_avatar
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.article_id = ?
        ORDER BY c.created_at DESC
    ";
    
    $stmt = $pdo->prepare($commentsQuery);
    $stmt->execute([$articleId]);
    $comments = $stmt->fetchAll();
    
    // Formatage des commentaires
    $formattedComments = [];
    foreach ($comments as $comment) {
        $date = new DateTime($comment['created_at']);
        $formattedComments[] = [
            'id' => $comment['id'],
            'content' => $comment['content'],
            'author_name' => $comment['author_name'],
            'author_avatar' => $comment['author_avatar'],
            'created_at' => $date->format('d M Y'),
            'datetime' => $comment['created_at']
        ];
    }
    
    // Vérification si l'utilisateur connecté a liké cet article
    $userLiked = false;
    if (isset($_SESSION['user_id'])) {
        $likeCheckQuery = "SELECT id FROM likes WHERE user_id = ? AND article_id = ?";
        $stmt = $pdo->prepare($likeCheckQuery);
        $stmt->execute([$_SESSION['user_id'], $articleId]);
        $userLiked = $stmt->fetch() ? true : false;
    }
    
    // Formatage de l'article
    $date = new DateTime($article['created_at']);
    $coverImage = $article['cover_image_url'];
    
    $formattedArticle = [
        'id' => $article['id'],
        'title' => $article['title'],
        'content' => $article['content'],
        'cover_image' => $coverImage,
        'author' => [
            'id' => $article['user_id'],
            'name' => $article['author_name'],
            'avatar' => $article['author_avatar'],
            'bio' => $article['author_bio']
        ],
        'created_at' => $date->format('d M Y'),
        'datetime' => $article['created_at'],
        'views' => $article['views'] + 1, // +1 car on vient d'incrémenter
        'likes_count' => $article['likes_count'],
        'comments_count' => $article['comments_count'],
        'user_liked' => $userLiked,
        'is_author' => isset($_SESSION['user_id']) && $_SESSION['user_id'] == $article['user_id']
    ];
    
    echo json_encode([
        'success' => true,
        'article' => $formattedArticle,
        'comments' => $formattedComments
    ]);
    
} catch (Exception $e) {
    error_log("Erreur lors de la récupération de l'article: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 