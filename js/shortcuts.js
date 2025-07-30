import {
    formatBold,
    formatItalic,
    formatUnderline,
    formatHighlight,
    formatCode,
    formatH1,
    formatH2,
    formatH3,
    formatBlockquote,
    formatList,
    formatLink,
    formatImage,
    // formatTable // SUPPRIMÉ
} from './wysiwygActions.js';
import { insertMarkdownAtSelection } from './edition.js';
import { insertCodeBlock } from './codeBlock.js';

// Gestionnaire de raccourcis clavier pour l'éditeur Markdown
export function handleShortcuts(e) {
    // Gestion des raccourcis Ctrl/Cmd standards
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                formatBold();
                break;
            case 'i':
                e.preventDefault();
                formatItalic();
                break;
            case 'u':
                e.preventDefault();
                formatUnderline();
                break;
            case 's':
                e.preventDefault();
                saveContent();
                break;
        }
    }
    // Gestion des raccourcis Alt/Option
    if (e.altKey) {
        switch(e.key.toLowerCase()) {

            // Nouveaux raccourcis avec Alt
            case 'h':  // Alt + H (Headers)
                e.preventDefault();
                if (e.shiftKey) {
                    formatH3(); // Alt + Shift + H pour H3
                } else {
                    formatH1(); // Alt + H pour H1
                }
                break;
            case '2':
                e.preventDefault();
                formatH2();
                break;

            // Formatage
            case 'u':
                e.preventDefault();
                formatUnderline();
                break;
            case 'm':
                e.preventDefault();
                formatHighlight();
                break;
            case 'k':
                e.preventDefault();
                formatCode();
                break;
            case 'c':
                e.preventDefault();
                insertCodeBlock();
                break;
            case 'l':
                e.preventDefault();
                if (e.shiftKey) {
                    // Alt+Shift+L : ouvrir le vrai popup image
                    import('./image.js').then(module => {
                        module.createLinkPopup(true).then(markdown => {
                            const editor = document.getElementById('editor');
                            window.getSelection().removeAllRanges();
                            insertMarkdownAtSelection(markdown);
                        });
                    });
                } else {
                    // Alt+L : ouvrir le popup lien
                    import('./image.js').then(module => {
                        module.createLinkPopup(false).then(markdown => {
                            const editor = document.getElementById('editor');
                            window.getSelection().removeAllRanges();
                            insertMarkdownAtSelection(markdown);
                        });
                    });
                }
                break;
            case 't':
                // e.preventDefault();
                // formatTable();
                break;

            // Listes
            case 'n':
                e.preventDefault();
                formatList('ul');  // Alt + N pour liste non ordonnée
                break;
            case 'o':
                e.preventDefault();
                formatList('ol'); // Alt + O pour liste ordonnée
                break;

            // Blocs spéciaux
            case 'q':
                e.preventDefault();
                formatBlockquote();
                break;
            case 'c':
                e.preventDefault();
                formatCode();
                break;
        }
    }
}

// Fonction de sauvegarde (à implémenter selon vos besoins)
function saveContent() {
    // Déclencher le clic sur le bouton de sauvegarde
    document.getElementById('saveBtn').click();
}

document.addEventListener('DOMContentLoaded', function() {
    // Ajout du gestionnaire de raccourcis clavier global
    const editor = document.getElementById('editor');
    if (editor) {
        editor.addEventListener('keydown', handleShortcuts);
    }

    // Toggle barre d'outils Markdown
    const outilsBtn = document.getElementById('outils');
    const markdownTools = document.querySelector('.markdown-tools');
    if (outilsBtn && markdownTools) {
        outilsBtn.addEventListener('click', function() {
            markdownTools.classList.toggle('visible');
        });
    }
});

