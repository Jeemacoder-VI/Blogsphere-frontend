<?php
// Affichage des erreurs pour le debug
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once './classes/database.php';
require_once './classes/user.php';

$user = new User();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<strong>Formulaire soumis</strong><br>";

    $username = $_POST['username'] ?? '';
    $email    = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $bio      = $_POST['bio'] ?? '';
    $avatar   = null;

    // Gestion de l'avatar
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $filename = uniqid() . '_' . basename($_FILES['avatar']['name']);
        $targetPath = $uploadDir . $filename;

        if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetPath)) {
            $avatar = $targetPath;
        } else {
            echo "<script>alert(\"Erreur lors de l'enregistrement de l'avatar.\");</script>";
            exit;
        }
    }

    // Vérifie que tous les champs nécessaires sont remplis
    if (!empty($username) && !empty($email) && !empty($password)) {
        try {
            $success = $user->register($username, $email, $password, $bio, $avatar);

            if ($success) {
                echo "<script>alert('Inscription réussie !');</script>";
                header('location:connexion.php');
            } else {
                echo "<script>alert(\"Erreur lors de l'inscription.\");</script>";
            }
        } catch (Exception $e) {
            echo "<script>alert('Erreur : " . addslashes($e->getMessage()) . "');</script>";
        }
    } else {
        echo "<script>alert('Veuillez remplir tous les champs obligatoires.');</script>";
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

        <form action="inscription.php" method="POST" enctype="multipart/form-data">
            <div class="form-group">
                <label for="name">Nom</label>
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
