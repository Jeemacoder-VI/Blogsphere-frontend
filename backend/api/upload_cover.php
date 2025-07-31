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

// Vérifier si un fichier a été uploadé
if (!isset($_FILES['cover_image']) || $_FILES['cover_image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Aucun fichier uploadé ou erreur d\'upload']);
    exit;
}

$file = $_FILES['cover_image'];
$article_id = isset($_POST['article_id']) ? (int)$_POST['article_id'] : null;

// Vérifier le type de fichier
if (!in_array($file['type'], ALLOWED_IMAGE_TYPES)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => ERROR_MESSAGES['invalid_file_type']]);
    exit;
}

// Vérifier la taille du fichier
if ($file['size'] > MAX_FILE_SIZE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => ERROR_MESSAGES['file_too_large']]);
    exit;
}

// Créer le dossier d'upload s'il n'existe pas
if (!file_exists(COVERS_DIR)) {
    mkdir(COVERS_DIR, 0755, true);
}

// Générer un nom de fichier unique
$file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$file_name = uniqid() . '_' . time() . '.' . $file_extension;
$file_path = COVERS_DIR . $file_name;

// Déplacer le fichier uploadé
if (move_uploaded_file($file['tmp_name'], $file_path)) {
    $image_url = $file_path;
    
    // Si un article_id est fourni, mettre à jour la base de données
    if ($article_id) {
        try {
            // Vérifier que l'article appartient à l'utilisateur connecté
            $stmt = $pdo->prepare("SELECT id FROM articles WHERE id = ? AND user_id = ?");
            $stmt->execute([$article_id, $_SESSION['user_id']]);
            
            if ($stmt->fetch()) {
                // Mettre à jour l'image de couverture dans article_editions
                $stmt = $pdo->prepare("
                    UPDATE article_editions 
                    SET cover_image_url = ?, updated_at = NOW()
                    WHERE article_id = ? AND user_id = ?
                ");
                $stmt->execute([$image_url, $article_id, $_SESSION['user_id']]);
                
                // Si aucune édition n'existe, en créer une
                if ($stmt->rowCount() === 0) {
                    $stmt = $pdo->prepare("
                        INSERT INTO article_editions (article_id, user_id, title, content, cover_image_url, created_at) 
                        VALUES (?, ?, '', '', ?, NOW())
                    ");
                    $stmt->execute([$article_id, $_SESSION['user_id'], $image_url]);
                }
            }
        } catch(PDOException $e) {
            // Log l'erreur mais ne pas échouer l'upload
            logError("Erreur lors de la mise à jour de l'image de couverture", ['error' => $e->getMessage(), 'user_id' => $_SESSION['user_id']]);
        }
    }
    
    echo json_encode([
        'success' => true, 
        'message' => 'Image uploadée avec succès',
        'image_url' => $image_url,
        'file_name' => $file_name
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => ERROR_MESSAGES['upload_failed']]);
}
?> 