<?php
session_start();
require_once __DIR__ . '/../config/config.php';

// Vérifier si l'utilisateur est connecté
$logged_in = isLoggedIn();

// Retourner la réponse en JSON
header('Content-Type: application/json');
echo json_encode([
    'logged_in' => $logged_in,
    'user_id' => $logged_in ? $_SESSION['user_id'] : null,
    'username' => $logged_in ? ($_SESSION['username'] ?? 'Utilisateur') : null
]);
?> 