<?php 
require_once __DIR__ . '/backend/config/config.php';
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// Vérifier si l'utilisateur est connecté
if (!isLoggedIn()) {
    redirect('connexion.php');
}
?>
<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="UTF-8">
  <title>Profils BlogSphere</title>
  <script src="https://kit.fontawesome.com/a5d5d09acd.js" crossorigin="anonymous"></script>

  <style>
    /*Je declare les variables que je vais utiliser le plus dans mon code .  */
    :root {
      --bg-color: #D1ECF1;
      --font-text: charter, Georgia, Cambria, "Times New Roman", Times, serif;
      --bg-color: #D1ECF1;
      --font-text: charter, Georgia, Cambria, "Times New Roman", Times, serif;
      --primary-green: #1a8917;
      --secondary-teal: #41c9b4;
      --text-dark: #242424;
      --text-gray: #6b6b6b;
      --border-light: #e6e6e6;
      --white: #ffffff;
      --black: black;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: charter, Georgia, Cambria, "Times New Roman", Times, serif;
      line-height: 1.6;
      color: #242424;
      background-color: #D1ECF1;
      max-height: 100vh;
    }

    /* Navigation */
    .navbar {
      background: var(--white);
      border-bottom: 1px solid var(--border-light);
      padding: 0 20px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .navbar .logo {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-dark);
      cursor: pointer;
      text-decoration: none;
    }

    .navbar input[type="search"] {
      background: #f8f9fa;
      border: 1px solid var(--border-light);
      border-radius: 24px;
      padding: 8px 16px;
      font-size: 14px;
      width: 300px;
      outline: none;
      transition: all 0.2s;
    }

    .navbar input[type="search"]:focus {
      background: var(--white);
      border-color: var(--primary-green);
      box-shadow: 0 0 0 2px rgba(26, 137, 23, 0.1);
    }

    .nav-icons {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .write-icon,
    .notif-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
      color: black;
    }

    .write-icon:hover,
    .notif-icon:hover {
      background: black;
      color: #D1ECF1;
    }

    .user-profile-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(45deg, var(--primary-green), var(--secondary-teal));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .user-profile-icon:hover {
      transform: scale(1.1);
    }

    /* Bannière publicitaire */
    .pub-espace {
      background: linear-gradient(90deg, var(--primary-green), var(--secondary-teal));
      color: white;
      padding: 8px 0;
      text-align: center;
    }

    .pub-espace h3 {
      font-size: 14px;
      font-weight: 500;
    }

    .pub-espace span {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
    }


    .profile-card {
      background: linear-gradient(120deg, var(--white) 60%, var(--secondary-teal) 100%);
      padding: 40px 32px 32px 32px;
      max-width: 480px;
      margin: 40px auto 32px auto;
      border-radius: 18px;
      box-shadow: 0 6px 32px 0 rgba(26, 137, 23, 0.10), 0 1.5px 6px 0 rgba(65, 201, 180, 0.08);
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .profile-photo {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 18px;
      border: 2px solid var(--primary-green);
      box-shadow: 0 2px 12px rgba(65, 201, 180, 0.10);
      background: var(--white);
    }

    .profile-card h2 {
      margin: 12px 0 6px;
      font-size: 2rem;
      color: var(--primary-green);
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .profile-card .bio {
      color: var(--text-gray);
      font-size: 1.08rem;
      margin-bottom: 18px;
    }

    .profile-card .profile-meta {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 18px;
      margin-bottom: 18px;
    }

    .profile-card .profile-meta span {
      background: var(--primary-green);
      color: var(--white);
      padding: 4px 14px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: 0.2px;
    }

    .profile-card button {
      margin-top: 10px;
      padding: 10px 22px;
      background: linear-gradient(90deg, var(--primary-green), var(--secondary-teal));
      color: var(--white);
      border: none;
      border-radius: 24px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(65, 201, 180, 0.08);
      transition: background 0.2s, transform 0.2s;
    }

    .profile-card button:hover {
      background: linear-gradient(90deg, var(--secondary-teal), var(--primary-green));
      transform: translateY(-2px) scale(1.04);
    }

    .articles-list {
      margin-top: 18px;
      text-align: left;
      display: none;
      background: #f8f9fa;
      padding: 18px 18px 10px 18px;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(65, 201, 180, 0.07);
    }

    .articles-list ul {
      padding-left: 18px;
    }

    .articles-list li {
      margin-bottom: 10px;
      font-size: 1.04rem;
    }

    .articles-list a {
      text-decoration: none;
      color: var(--primary-green);
      font-weight: 500;
      transition: color 0.2s;
    }

    .articles-list a:hover {
      color: var(--secondary-teal);
      text-decoration: underline;
    }
  </style>
</head>

<body>
  <nav class="navbar">
    <div class="logo">BlogSphere</div>
    <!-- <input type="search" placeholder="Rechercher des articles..."> -->
    <div class="nav-icons">
      <div class="write-icon">
        <i class="fas fa-pen" title="Écrire un article"></i>
      </div>
      <div class="notif-icon">
        <i class="fas fa-bell" title="Notifications"></i>
      </div>
      <div class="user-profile-icon" title="Mon profil">
        <i class="fas fa-user"></i>
      </div>
    </div>
  </nav>

  <div class="pub-espace">
    <marquee behavior="" direction="">
      <h3><span>-10%</span> : Rejoignez-nous dès maintenant et découvrez des milliers d'articles passionnants</h3>
    </marquee>
  </div>

  <!-- Profil dynamique -->
  <div id="profile-container"></div>
  <div id="profile-container"></div>

  <!-- <script src="js/articles.js"></script> -->
  <script>
  function toggleArticles(id) {
    const element = document.getElementById(id);
    element.style.display = (element.style.display === "block") ? "none" : "block";
  }

  // Récupère le nom de l'auteur depuis l'URL
  function getAuthorFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('author');
  }

  async function loadUserProfile() {
    const author = getAuthorFromURL();
    if (!author) {
      document.getElementById('profile-container').innerHTML = "<p>Aucun auteur spécifié.</p>";
      return;
    }

    try {
      const response = await fetch(`backend/api/get_user_profile.php?author=${encodeURIComponent(author)}`);
      const data = await response.json();

      if (!data.success) {
        document.getElementById('profile-container').innerHTML = `<p>${data.error}</p>`;
        return;
      }

      const user = data.user;

      document.getElementById('profile-container').innerHTML = `
        <div class="profile-card">
          <img src="${user.avatar}" alt="${user.name}" class="profile-photo">
          <h2>${user.name}</h2>
          <p class="bio">${user.bio}</p>
          <button onclick="toggleArticles('user-articles')">📚 Articles publiés</button>
          <div class="articles-list" id="user-articles">
            <h3>Articles de ${user.name} :</h3>
            <ul>
              ${user.articles.map(a => `<li><a href="${a.link}">${a.title}</a></li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    } catch (error) {
      console.error(error);
      document.getElementById('profile-container').innerHTML = "<p>Erreur lors du chargement du profil utilisateur.</p>";
    }
  }

  document.addEventListener('DOMContentLoaded', loadUserProfile);
</script>


</body>

</html>