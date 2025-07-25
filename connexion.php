<?php
require_once './classes/database.php';
require_once './classes/user.php';

session_start();
$erreur = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!empty($email) && !empty($password)) {
        $user = new User();
        $result = $user->login($email, $password); // ✅ Correction ici
        if ($result) {
            $_SESSION['user'] = $result;
            header('Location: articles.html'); // ✅ Redirection après connexion
            exit;
        } else {
            $erreur = "Email ou mot de passe incorrect.";
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

        <form method="POST" action="connexion.php">
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
