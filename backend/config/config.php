<?php
// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'Blogsphere');
define('DB_USER', 'root');
define('DB_PASS', '');

// Configuration de l'application
define('APP_NAME', 'BlogSphere');
define('APP_URL', 'http://localhost/blogs/Frontend/');
define('BACKEND_URL', 'http://localhost/blogs/Frontend/backend/');

// Configuration des uploads
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('COVERS_DIR', UPLOAD_DIR . 'covers/');
define('AVATARS_DIR', UPLOAD_DIR . 'avatars/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);

// Configuration des sessions
define('SESSION_NAME', 'blogsphere_session');
define('SESSION_LIFETIME', 3600); // 1 heure

// Configuration de sécurité
define('CSRF_TOKEN_NAME', 'blogsphere_csrf');
define('PASSWORD_COST', 12);

// Configuration des messages d'erreur
define('ERROR_MESSAGES', [
    'db_connection' => 'Erreur de connexion à la base de données',
    'user_not_found' => 'Utilisateur non trouvé',
    'invalid_credentials' => 'Email ou mot de passe incorrect',
    'email_exists' => 'Cet email est déjà utilisé',
    'file_too_large' => 'Fichier trop volumineux. Maximum 5MB',
    'invalid_file_type' => 'Type de fichier non autorisé',
    'upload_failed' => 'Erreur lors de l\'upload du fichier',
    'not_authorized' => 'Accès non autorisé',
    'article_not_found' => 'Article non trouvé',
    'validation_failed' => 'Données invalides'
]);

// Fonction pour obtenir la connexion PDO
function getPDO() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch(PDOException $e) {
        error_log("Erreur de connexion PDO: " . $e->getMessage());
        throw new Exception(ERROR_MESSAGES['db_connection']);
        //  die("Erreur PDO réelle : " . $e->getMessage());
    }
}

// Fonction pour vérifier si l'utilisateur est connecté
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Fonction pour rediriger
function redirect($url) {
    header("Location: " . $url);
    exit;
}

// Fonction pour générer un token CSRF
function generateCSRFToken() {
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

// Fonction pour vérifier un token CSRF
function verifyCSRFToken($token) {
    return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}

// Fonction pour nettoyer les données
        function sanitize($value) {
    return trim($value); 
}

// Fonction pour valider un email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Fonction pour logger les erreurs
function logError($message, $context = []) {
    $logMessage = date('Y-m-d H:i:s') . " - " . $message;
    if (!empty($context)) {
        $logMessage .= " - Context: " . json_encode($context);
    }
    error_log($logMessage);
}
?> 