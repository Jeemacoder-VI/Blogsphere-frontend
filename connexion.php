<?php
require_once __DIR__ . '/backend/config/config.php';
require_once __DIR__ . '/backend/classes/database.php';
require_once __DIR__ . '/backend/classes/user.php';

session_start();
$erreur = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitize($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!empty($email) && !empty($password)) {
        if (!validateEmail($email)) {
            $erreur = "Format d'email invalide.";
        } else {
            $user = new User();
            $result = $user->login($email, $password);
            if ($result) {
                $_SESSION['user_id'] = $result['id'];
                $_SESSION['username'] = $result['username'];
                $_SESSION['email'] = $result['email'];
                redirect('../Frontend/articles.php');
            } else {
                $erreur = ERROR_MESSAGES['invalid_credentials'];
            }
        }
    } else {
        $erreur = "Veuillez remplir tous les champs.";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion | BlogSphere</title>
    <link rel="stylesheet" href="css/stylelogin.css">
</head>
<body>
    <div class="signup-container">
        <div class="logo">Blogsphere</div>
        <h2>Se connecter</h2>

        <?php if (!empty($erreur)): ?> 
            <div style="color:red;"><?php echo htmlspecialchars($erreur); ?></div>
        <?php endif; ?>

        <form method="POST" action="">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>

            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" name="password" required>  
            </div>

            <button type="submit" class="signup-btn">Se connecter</button>
        </form>

        <div class="login-link">
            Nouveau ici ? <a href="inscription.php">S'inscrire</a>
        </div>
    </div>
</body>
</html>
    </div>
</body>
</html>
