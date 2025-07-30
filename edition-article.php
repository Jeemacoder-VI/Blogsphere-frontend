
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

// Récupérer l'ID de l'article depuis l'URL si fourni
$article_id = isset($_GET['id']) ? (int)$_GET['id'] : '';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edition article</title>
    <link rel="stylesheet" href="css/edition.css">
    <link rel="stylesheet" href="css/shortcuts.css">
    <!-- Lien CDN Font Awesome v6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="https://unpkg.com/turndown/dist/turndown.js"></script>
</head>
<body>
    <!-- En-tête avec la barre d'outils -->
    <header class="toolbar">
        <div class="logo">
            <input type="hidden" id="documentId" value="<?php echo htmlspecialchars($article_id); ?>">
        </div>
        <div class="actions">
            <a href="articles.php" class="back-button">
                <i class="fa-regular fa-newspaper">Articles</i>
            </a>
            <button id="outils" title="Barre d'outils" class="outils-btn">
                <i class="fa-solid fa-screwdriver-wrench"></i>
            </button>
            <button id="saveBtn" title="Publier uniquement">
                <i class="icon">S</i>
            </button>
            <button id="draftBtn" title="Sauvegarder comme brouillon">
                <i class="fa-regular fa-floppy-disk icon"></i>
            </button>
            <button id="clearBtn" title="Effacer">
                <i class="fa-regular fa-trash-can icon"></i>
            </button>
            <button id="shortcutsBtn" title="Raccourcis clavier" class="shortcuts-btn">
                <i class="fa-solid fa-keyboard icon"></i>
            </button>
        </div>
    </header>
    <!-- Barre d'outils Markdown placée en haut -->
    <div class="markdown-tools" style="z-index: 1000; position: fixed;">
        <button data-md="**texte**">
            <i class="fa-solid fa-bold"></i>
        </button>
        <button data-md="*texte*">
            <i class="fa-solid fa-italic"></i>
        </button>
        <button data-md="# ">
            <i class="fa-solid fa-heading">1</i>
        </button>
        <button data-md="## ">
            <i class="fa-solid fa-heading">2</i>
        </button>
        <button data-md="### ">
            <i class="fa-solid fa-heading">3</i>
        </button>
        <button data-md="- " title="Liste non ordonnée">
            <i class="fa-solid fa-list-ul"></i>
        </button>
        <button data-md="1. " title="Liste ordonnée">
            <i class="fa-solid fa-list-ol"></i>
        </button>
        <button data-md="==" title="Surligner">
            <i class="fa-solid fa-highlighter"></i>
        </button>
        <button data-md="quote" title="Citation">
            <i class="fa-solid fa-quote-left"></i>
        </button>
        <button data-md="`code`" title="Code en ligne">
            <i class="fa-solid fa-code"></i>
        </button>
        <button id="codeBlockBtn" title="Bloc de code avec coloration syntaxique">
            <i class="fa-solid fa-file-code"></i>
        </button>
        <button data-md="__texte__" title="Souligner">
            <i class="fa-solid fa-underline"></i>
        </button>
        <button data-md="link" title="Insérer un lien">
            <i class="fa-solid fa-link"></i>
        </button>
        <button data-md="image" title="Insérer une image">
            <i class="fa-regular fa-image"></i>
        </button>
    </div>
    <!-- Bloc titre de l'article -->
    <div class="article-title-block">
        <label for="documentTitle" class="article-title-label">Article titre :</label>
        <span id="documentTitle" class="document-title" contenteditable="true"></span>
    </div>
    <!-- Conteneur image de couverture -->
    <div id="cover-container" class="cover-container">
        <span id="cover-placeholder">Cliquez pour ajouter une image de couverture</span>
        <img id="cover-image" src="" alt="Image de couverture" style="display:none; width:100%; height:auto; border-radius:8px;" />
        <span id="cover-remove" class="cover-remove" style="display:none; position:absolute; top:10px; right:10px; background:#fff; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.08); cursor:pointer; font-size:1.3rem; color:#e96449; border:1.5px solid #e96449; z-index:3;">&times;</span>
    </div>
    <!-- Conteneur principal -->
    <main class="editor-container">
        <!-- Conteneur de l'éditeur -->
        <div class="editor-wrapper">
            <div class="editor-column">
                <div id="editor" class="editor wysiwyg preview" contenteditable="true" spellcheck="true"></div>
            </div>
        </div>
    </main>

    <!-- Liste des raccourcis clavier -->
    <div id="shortcuts-help" class="shortcuts-help">
        <h3>Raccourcis clavier</h3>
        
        <div class="shortcuts-os-section">
            <h4>Windows / Linux</h4>
            <ul>
                <!-- Raccourcis standards -->
                <li><kbd>Ctrl</kbd> + <kbd>B</kbd> : Gras</li>
                <li><kbd>Ctrl</kbd> + <kbd>I</kbd> : Italique</li>
                <li><kbd>Ctrl</kbd> + <kbd>S</kbd> : Sauvegarder</li>
            </ul>
            <h5>Mise en forme</h5>
            <ul>
                <li><kbd>Alt</kbd> + <kbd>H</kbd> : Titre 1</li>
                <li><kbd>Alt</kbd> + <kbd>2</kbd> : Titre 2</li>
                <li><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd> : Titre 3</li>
                <li><kbd>Alt</kbd> + <kbd>U</kbd> : Souligné</li>
                <li><kbd>Alt</kbd> + <kbd>M</kbd> : Surligner</li>
            </ul>
            <h5>Insertions</h5>
            <ul>
                <li><kbd>Alt</kbd> + <kbd>K</kbd> : Code en ligne</li>
                <li><kbd>Alt</kbd> + <kbd>C</kbd> : Bloc de code</li>
                <li><kbd>Alt</kbd> + <kbd>L</kbd> : Lien</li>
                <li><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> : Image</li>
            </ul>
            <h5>Listes et Citations</h5>
            <ul>
                <li><kbd>Alt</kbd> + <kbd>N</kbd> : Liste à puces</li>
                <li><kbd>Alt</kbd> + <kbd>O</kbd> : Liste numérotée</li>
                <li><kbd>Alt</kbd> + <kbd>Q</kbd> : Citation</li>
            </ul>
        </div>

        <div class="shortcuts-os-section">
            <h4>Mac</h4>
            <ul>
                <!-- Raccourcis standards -->
                <li><kbd>⌘</kbd> + <kbd>B</kbd> : Gras</li>
                <li><kbd>⌘</kbd> + <kbd>I</kbd> : Italique</li>
                <li><kbd>⌘</kbd> + <kbd>S</kbd> : Sauvegarder</li>
            </ul>
            <h5>Mise en forme</h5>
            <ul>
                <li><kbd>⌥</kbd> + <kbd>H</kbd> : Titre 1</li>
                <li><kbd>⌥</kbd> + <kbd>2</kbd> : Titre 2</li>
                <li><kbd>⌥</kbd> + <kbd>⇧</kbd> + <kbd>H</kbd> : Titre 3</li>
                <li><kbd>⌥</kbd> + <kbd>U</kbd> : Souligné</li>
                <li><kbd>⌥</kbd> + <kbd>M</kbd> : Surligner</li>
            </ul>
            <h5>Insertions</h5>
            <ul>
                <li><kbd>⌥</kbd> + <kbd>K</kbd> : Code en ligne</li>
                <li><kbd>⌥</kbd> + <kbd>C</kbd> : Bloc de code</li>
                <li><kbd>⌥</kbd> + <kbd>L</kbd> : Lien</li>
                <li><kbd>⌥</kbd> + <kbd>⇧</kbd> + <kbd>L</kbd> : Image</li>
            </ul>
            <h5>Listes et Citations</h5>
            <ul>
                <li><kbd>⌥</kbd> + <kbd>N</kbd> : Liste à puces</li>
                <li><kbd>⌥</kbd> + <kbd>O</kbd> : Liste numérotée</li>
                <li><kbd>⌥</kbd> + <kbd>Q</kbd> : Citation</li>
            </ul>
        </div>
    </div>

    <script type="module" src="js/shortcutsHelp.js"></script>
    <script type="module" src="js/shortcuts.js"></script>
    <script type="module" src="js/codeBlock.js"></script>
    <script type="module" src="js/enregistrement.js"></script>
    <script type="module" src="js/edition.js"></script>
    
    <script type="module">
        // Initialiser le bouton bloc de code
        document.addEventListener('DOMContentLoaded', async () => {
            const codeBlockBtn = document.getElementById('codeBlockBtn');
            if (codeBlockBtn) {
                codeBlockBtn.addEventListener('click', async () => {
                    try {
                        const { insertCodeBlock } = await import('./js/codeBlock.js');
                        insertCodeBlock();
                    } catch (error) {
                        console.error('Erreur lors du chargement du module codeBlock:', error);
                    }
                });
            }
        });
    </script>
</body>
</html>
