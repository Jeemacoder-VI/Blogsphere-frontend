<?php
session_start();
require_once __DIR__ . '/../config/config.php';

// Vérifier si l'utilisateur est connecté
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => ERROR_MESSAGES['not_authorized']]);
    exit;
}

// Obtenir la connexion PDO
try {
    $pdo = getPDO();
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

// Vérifier si c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupérer les données JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Données JSON invalides']);
    exit;
}

    // Valider les données requises
$required_fields = ['title', 'content', 'article_id'];
foreach ($required_fields as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Le champ '$field' est requis"]);
        exit;
    }
}

$title = sanitize($input['title']);
$content = trim($input['content']);
$article_id = (int)$input['article_id'];
$cover_image_url = isset($input['cover_image_url']) ? sanitize($input['cover_image_url']) : null;
$is_draft = isset($input['is_draft']) ? (bool)$input['is_draft'] : true;
$syntax_highlighting = isset($input['syntax_highlighting']) ? (bool)$input['syntax_highlighting'] : true;

// Validation supplémentaire
if (strlen($title) > 255) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Le titre est trop long (max 255 caractères)']);
    exit;
}

if (strlen($content) > 65535) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Le contenu est trop long']);
    exit;
}

try {
    // Vérifier que l'article existe et appartient à l'utilisateur connecté
    $stmt = $pdo->prepare("SELECT id FROM articles WHERE id = ? AND user_id = ?");
    $stmt->execute([$article_id, $_SESSION['user_id']]);
    
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Article non trouvé ou accès non autorisé']);
        exit;
    }
    
    // Commencer une transaction
    $pdo->beginTransaction();
    
    // Mettre à jour ou insérer dans article_editions
    $stmt = $pdo->prepare("
        INSERT INTO article_editions (article_id, user_id, title, content, cover_image_url, is_draft, syntax_highlighting, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
        title = VALUES(title),
        content = VALUES(content),
        cover_image_url = VALUES(cover_image_url),
        is_draft = VALUES(is_draft),
        syntax_highlighting = VALUES(syntax_highlighting),
        updated_at = NOW()
    ");
    
    $stmt->execute([
        $article_id,
        $_SESSION['user_id'],
        $title,
        $content,
        $cover_image_url,
        $is_draft,
        $syntax_highlighting
    ]);
    
    // Mettre à jour l'article principal si ce n'est pas un brouillon
    if (!$is_draft) {
        $stmt = $pdo->prepare("
            UPDATE articles 
            SET title = ?, content = ?, is_draft = FALSE, updated_at = NOW()
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$title, $content, $article_id, $_SESSION['user_id']]);
    }
    
    // Valider la transaction
    $pdo->commit();
    
    echo json_encode([
        'success' => true, 
        'message' => $is_draft ? 'Brouillon sauvegardé avec succès' : 'Article publié avec succès',
        'article_id' => $article_id,
        'is_draft' => $is_draft
    ]);
    
} catch(PDOException $e) {
    // Annuler la transaction en cas d'erreur
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    logError("Erreur lors de la sauvegarde de l'article", ['error' => $e->getMessage(), 'user_id' => $_SESSION['user_id']]);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la sauvegarde']);
}
?> 