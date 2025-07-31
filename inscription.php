<?php
require_once __DIR__ . '/backend/config/config.php';
require_once __DIR__ . '/backend/classes/database.php';
require_once __DIR__ . '/backend/classes/user.php';

session_start();

$user = new User();
$erreur = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitize($_POST['username'] ?? '');
    $email    = sanitize($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $bio      = sanitize($_POST['bio'] ?? '');
    $avatar   = null;

    // Validation des données
    if (empty($username) || empty($email) || empty($password)) {
        $erreur = "Veuillez remplir tous les champs obligatoires.";
    } elseif (!validateEmail($email)) {
        $erreur = "Format d'email invalide.";
    } elseif (strlen($password) < 6) {
        $erreur = "Le mot de passe doit contenir au moins 6 caractères.";
    } else {
        // Gestion de l'avatar
        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['avatar'];
            
            if (!in_array($file['type'], ALLOWED_IMAGE_TYPES)) {
                $erreur = ERROR_MESSAGES['invalid_file_type'];
            } elseif ($file['size'] > MAX_FILE_SIZE) {
                $erreur = ERROR_MESSAGES['file_too_large'];
            } else {
                $uploadDir = AVATARS_DIR;
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                $filename = uniqid() . '_' . basename($file['name']);
                $targetPath = $uploadDir . $filename;

                if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                    $avatar = 'backend/uploads/avatars/' . $filename;
                } else {
                    $erreur = ERROR_MESSAGES['upload_failed'];
                }
            }
        }

        // Inscription si pas d'erreur
        if (empty($erreur)) {
            try {
                $success = $user->register($username, $email, $password, $bio, $avatar);
                if ($success) {
                    $success = "Inscription réussie ! Vous pouvez maintenant vous connecter.";
                }
            } catch (Exception $e) {
                $erreur = $e->getMessage();
            }
        }
    }
}
?>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Inscription | BlogSphere</title>
    <link rel="stylesheet" href="css/styleinscription.css">
</head>
<body>
    <div class="signup-container">
        <div class="logo">Blogsphere</div>
        <h2>Créer un compte</h2>

        <?php if (!empty($erreur)): ?>
            <div class="error-message"><?php echo htmlspecialchars($erreur); ?></div>
        <?php endif; ?>

        <?php if (!empty($success)): ?>
            <div class="success-message"><?php echo htmlspecialchars($success); ?></div>
        <?php endif; ?>

        <form action="" method="POST" enctype="multipart/form-data">
            <div class="form-group">
                <label for="name">Nom/pseudo</label>
                <input type="text" id="name" name="username" required>
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>

            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" name="password" required>
            </div>

            <div class="form-group">
                <label for="bio">Bio</label>
                <textarea id="bio" name="bio" rows="4" placeholder="Parle un peu de toi..."></textarea>
            </div>

            <div class="form-group">
                <label for="avatar">Photo de profil</label>
                <input type="file" id="avatar" name="avatar" accept="image/*">
            </div>

            <button type="submit" class="signup-btn">S'inscrire</button>
        </form>

        <div class="login-link">
            Déjà inscrit ? <a href="connexion.php">Connectez-vous</a>
        </div>
    </div>
</body>
</html>
