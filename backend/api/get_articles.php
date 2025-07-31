<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/config.php';

try {
    $pdo = getPDO();
    
    // Récupération des articles avec les informations des auteurs, les statistiques et les images de couverture
    $query = "
        SELECT 
            a.id,
            a.title,
            a.content,
            a.views,
            a.created_at,
            a.updated_at,
            a.is_draft,
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
        WHERE a.is_draft = 0
        GROUP BY a.id, a.title, a.content, a.views, a.created_at, a.updated_at, a.is_draft, u.username, u.avatar, u.bio, ae.cover_image_url
        ORDER BY a.created_at DESC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $articles = $stmt->fetchAll();
    
    // Formatage des données pour le frontend
    $formattedArticles = [];
    foreach ($articles as $article) {
        // Extraction d'un extrait du contenu (premiers 150 caractères)
        $content = strip_tags($article['content']);
        $excerpt = strlen($content) > 150 ? substr($content, 0, 150) . '...' : $content;
        
        // Utilisation de l'image de couverture depuis article_editions ou image par défaut
        $coverImage = !empty($article['cover_image_url']) ? $article['cover_image_url'] : 'assets/uxbg.jpg';
        
        
        // Formatage de la date
        $date = new DateTime($article['created_at']);
        $formattedDate = $date->format('d M Y');
        
        $formattedArticles[] = [
            'id' => $article['id'],
            'title' => $article['title'],
            'cover' => $coverImage,
            'desc' => $excerpt,
            'author' => $article['author_name'],
            'avatar' => $article['author_avatar'],
            'date' => $formattedDate,
            'link' => 'article.php?id=' . $article['id'],
            'views' => $article['views'],
            'comments_count' => $article['comments_count'],
            'likes_count' => $article['likes_count'],
            'created_at' => $article['created_at'],
            'popularity_score' => ($article['views'] * 0.3) + ($article['likes_count'] * 0.5) + ($article['comments_count'] * 0.2)
        ];
    }
    
    echo json_encode([
        'success' => true,
        'articles' => $formattedArticles,
        'total' => count($formattedArticles)
    ]);
    
} catch (Exception $e) {
    error_log("Erreur lors de la récupération des articles: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la récupération des articles',
        'message' => $e->getMessage()
    ]);
}
?> 