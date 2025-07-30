<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/database.php';

class User {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    // Inscription utilisateur
    public function register($username, $email, $password, $bio = '', $avatar = null) {
        // Vérifie si l'email existe déjà
        $checkStmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email");
        $checkStmt->execute([':email' => $email]);

        if ($checkStmt->fetch()) {
            throw new Exception("Cet email est déjà utilisé.");
        }

        // Hachage du mot de passe
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Prépare la requête d'insertion
        $sql = "INSERT INTO users (username, email, password, bio, avatar) 
                VALUES (:username, :email, :password, :bio, :avatar)";
        $stmt = $this->conn->prepare($sql);

        // Exécute avec paramètres
        $result = $stmt->execute([
            ':username' => $username,
            ':email'    => $email,
            ':password' => $hashedPassword,
            ':bio'      => $bio,
            ':avatar'   => $avatar
        ]);

        if (!$result) {
            throw new Exception("Erreur lors de l'inscription.");
        }

        return true;
    }

    // Connexion utilisateur
    public function login($email, $password) {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = :email");
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                // Retirer le hash du password avant de retourner l'objet utilisateur
                unset($user['password']);
                return $user;
            } else {
                return false; // Email ou mot de passe incorrect
            }
        } catch (PDOException $e) {
            throw new Exception("Erreur lors de la connexion : " . $e->getMessage());
        }
    }
    public function getUserById($id) {
    $stmt = $this->conn->prepare("SELECT id, username, email, bio FROM users WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

public function getUserArticles($userId) {
    $sql = "
        SELECT 
            a.id, a.title, a.views, a.created_at, a.is_draft,
            (SELECT COUNT(*) FROM likes l WHERE l.article_id = a.id) AS likes_count
        FROM articles a
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
    ";
    $stmt = $this->conn->prepare($sql);
    $stmt->execute([$userId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

}
