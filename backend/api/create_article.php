<?php
session_start();

// Debug logging
error_log("=== CREATE ARTICLE DEBUG START ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Session user_id: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'NON DÉFINI'));

require_once __DIR__ . '/../config/config.php';

// Afficher les erreurs pour le debug (RETIREZ EN PRODUCTION)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Headers pour JSON
header('Content-Type: application/json; charset=utf-8');

try {
    // Vérifier si l'utilisateur est connecté
    if (!isLoggedIn()) {
        error_log("Utilisateur non connecté");
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Utilisateur non connecté']);
        exit;
    }

    error_log("Utilisateur connecté avec ID: " . $_SESSION['user_id']);

    // Obtenir la connexion PDO
    try {
        $pdo = getPDO();
        error_log("Connexion BDD réussie");
    } catch(Exception $e) {
        error_log("Erreur connexion BDD: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erreur de connexion à la base de données']);
        exit;
    }

    // Vérifier si c'est une requête POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        error_log("Méthode non autorisée: " . $_SERVER['REQUEST_METHOD']);
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        exit;
    }

    // Récupérer les données JSON
    $json_input = file_get_contents('php://input');
    error_log("JSON reçu: " . $json_input);
    
    $input = json_decode($json_input, true);

    if (!$input) {
        error_log("Erreur décodage JSON: " . json_last_error_msg());
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Données JSON invalides: ' . json_last_error_msg()]);
        exit;
    }

    error_log("Données décodées: " . print_r($input, true));

    // Valider les données requises
    $required_fields = ['title', 'content'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            error_log("Champ manquant: $field");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Le champ '$field' est requis"]);
            exit;
        }
    }

    // Fonction sanitize de base si elle n'existe pas
    if (!function_exists('sanitize')) {
        error_log("Fonction sanitize non trouvée, utilisation de htmlspecialchars");
        function sanitize($value) {
    return trim($value); 
}

    }

    $title = sanitize($input['title']);
    $content = trim($input['content']);
    $cover_image_url = isset($input['cover_image_url']) ? sanitize($input['cover_image_url']) : null;
    $is_draft = isset($input['is_draft']) ? (int)(bool)$input['is_draft'] : 1;
    $syntax_highlighting = isset($input['syntax_highlighting']) ? (int)(bool)$input['syntax_highlighting'] : 1;

    error_log("Données traitées - Title: $title, Draft: " . ($is_draft ? 'true' : 'false'));

    // Validation supplémentaire
    if (strlen($title) > 255) {
        error_log("Titre trop long: " . strlen($title));
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Le titre est trop long (max 255 caractères)']);
        exit;
    }

    if (strlen($content) > 65535) {
        error_log("Contenu trop long: " . strlen($content));
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Le contenu est trop long']);
        exit;
    }

    // Commencer une transaction
    $pdo->beginTransaction();
    error_log("Transaction commencée");
    
    // Créer l'article principal
    $stmt = $pdo->prepare("
        INSERT INTO articles (user_id, title, content, is_draft, created_at) 
        VALUES (?, ?, ?, ?, NOW())
    ");
    
    error_log("Requête articles préparée");
    
    $result1 = $stmt->execute([
        $_SESSION['user_id'],
        $title,
        $content,
        $is_draft
    ]);
    
    error_log("Résultat insert articles: " . ($result1 ? 'SUCCESS' : 'FAILED'));
    
    if (!$result1) {
        error_log("Erreur insert articles: " . print_r($stmt->errorInfo(), true));
        throw new Exception("Erreur lors de l'insertion dans articles");
    }
    
    $article_id = $pdo->lastInsertId();
    error_log("Article ID généré: " . $article_id);
    
    // Créer l'édition correspondante
    $stmt = $pdo->prepare("
        INSERT INTO article_editions (article_id, user_id, title, content, cover_image_url, is_draft, syntax_highlighting, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    error_log("Requête article_editions préparée");
    
    $result2 = $stmt->execute([
        $article_id,
        $_SESSION['user_id'],
        $title,
        $content,
        $cover_image_url,
        $is_draft,
        $syntax_highlighting
    ]);
    
    error_log("Résultat insert article_editions: " . ($result2 ? 'SUCCESS' : 'FAILED'));
    
    if (!$result2) {
        error_log("Erreur insert article_editions: " . print_r($stmt->errorInfo(), true));
        throw new Exception("Erreur lors de l'insertion dans article_editions");
    }
    
    // Valider la transaction
    $pdo->commit();
    error_log("Transaction commitée avec succès");
    
    echo json_encode([
        'success' => true, 
        'message' => $is_draft ? 'Brouillon créé avec succès' : 'Article créé et publié avec succès',
        'article_id' => $article_id,
        'is_draft' => $is_draft
    ]);
    
} catch(PDOException $e) {
    // Annuler la transaction en cas d'erreur
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
        error_log("Transaction rollback effectué");
    }
    
    error_log("Erreur PDO: " . $e->getMessage());
    error_log("Code erreur PDO: " . $e->getCode());
    
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur de base de données: ' . $e->getMessage()]);
    
} catch(Exception $e) {
    // Annuler la transaction en cas d'erreur
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
        error_log("Transaction rollback effectué (Exception générale)");
    }
    
    error_log("Erreur générale: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

error_log("=== CREATE ARTICLE DEBUG END ===");
?>