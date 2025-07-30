<?php
require_once './classes/database.php';

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
}
