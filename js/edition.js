// Constants
const STORAGE_KEY = 'markdown_content';
const TITLE_KEY = 'document_title';
const COVER_KEY = 'cover_image_url';

// Éléments DOM
const editor = document.getElementById('editor');
const clearBtn = document.getElementById('clearBtn');
const documentTitle = document.getElementById('documentTitle');
const markdownTools = document.querySelectorAll('.markdown-tools button');
const saveBtn = document.getElementById('saveBtn');
const documentId = document.getElementById('documentId');

// Ajout des dépendances globales
const turndownService = new TurndownService();
marked.setOptions({ breaks: true, gfm: true });

import { parseMarkdown } from "./conversionMarkdown.js";
import { handleShortcuts } from "./shortcuts.js";
import { highlightAllCodeBlocks } from "./highlight-init.js";
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
    formatImage
} from './wysiwygActions.js';

/**
 * Sauvegarde le document sur le serveur
 */
async function saveDocument() {
    showNotification('Sauvegarde en cours...'); // Affiche immédiatement une notification
    try {
        const markdownContent = getMarkdownFromEditor();
        const response = await fetch('../php/save_document.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: documentId.value,
                titre: documentTitle.textContent,
                contenu_markdown: markdownContent,
                contenu_html: wysiwygEditor.innerHTML
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Document sauvegardé avec succès');
            if (data.id && !documentId.value) {
                documentId.value = data.id;
                // Mettre à jour l'URL avec l'ID du document
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('id', data.id);
                window.history.pushState({}, '', newUrl);
            }
        } else {
            showNotification('Erreur lors de la sauvegarde: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Erreur lors de la sauvegarde: ' + error.message, 'error');
    }
}

/**
 * Met en place les écouteurs d'événements
 */
/**
 * Gère le titre du document
 */
function handleDocumentTitle() {
    // Charge le titre sauvegardé
    const savedTitle = localStorage.getItem(TITLE_KEY);
    if (savedTitle) {
        documentTitle.textContent = savedTitle;
    }

    // Sauvegarde le titre quand il change
    documentTitle.addEventListener('input', () => {
        localStorage.setItem(TITLE_KEY, documentTitle.textContent);
    });

    // Empêche les sauts de ligne
    documentTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            documentTitle.blur();
        }
    });
}

function setupEventListeners() {
    // Mise à jour en temps réel
    if (editor) editor.addEventListener('input', updatePreview);

    // Effacement
    if (clearBtn) clearBtn.addEventListener('click', clearContent);

    // Outils Markdown
    if (markdownTools && markdownTools.length) {
        markdownTools.forEach(button => {
            button.addEventListener('click', async () => {
                const md = button.dataset.md;
                switch(md) {
                    case '**texte**':
                        formatBold();
                        break;
                    case '*texte*':
                        formatItalic();
                        break;
                    case '__texte__':
                        formatUnderline();
                        break;
                    case '==':
                        formatHighlight();
                        break;
                    case '`code`':
                        formatCode();
                        break;
                    case '# ':
                        formatH1();
                        break;
                    case '## ':
                        formatH2();
                        break;
                    case '### ':
                        formatH3();
                        break;
                    case 'quote':
                        formatBlockquote();
                        break;
                    case '- ':
                        formatList('ul');
                        break;
                    case '1. ':
                        formatList('ol');
                        break;
                    case 'link':
                        formatLink();
                        break;
                    case 'image': {
                        // Affiche le popup image comme dans image.js
                        const module = await import('./image.js');
                        module.createLinkPopup(true).then(markdown => {
                            insertMarkdownAtSelection(markdown);
                            updatePreview();
                            saveToLocalStorage();
                        }).catch(() => {});
                        break;
                    }
                    default:
                        insertMarkdown(md);
                        setEditorContent(getMarkdownFromEditor());
                }
            });
        });
    }

    
    // Ajout de l'écouteur pour le bouton de sauvegarde
    saveBtn.addEventListener('click', saveDocument);

    // Ajout du raccourci clavier Ctrl+S / Cmd+S pour sauvegarder
    document.addEventListener('keydown', async function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            await saveDocument();
        }
      
    });
}

/**
 * Initialise l'éditeur
 */
function initEditor() {
    // Initialisation de la zone WYSIWYG après le chargement du DOM
    const wysiwygEditor = document.getElementById('editor');
    window.wysiwygEditor = wysiwygEditor; // Pour accès global si besoin
    // Charger le Markdown depuis la base ou localStorage
    const savedMarkdown = localStorage.getItem(STORAGE_KEY);
    // Texte de démonstration
    const demoText = [
        '# L\'Intelligence Artificielle Générative : Révolution ou Évolution ?',
        '',
        '> **L\'IA générative transforme notre façon de créer, de travailler et d\'interagir avec la technologie. Mais cette révolution technologique soulève aussi des questions fondamentales sur l\'avenir du travail et de la créativité humaine.**',
        '',
        '---',
        '',
        '## 🚀 L\'essor de l\'IA générative en 2025',
        '',
        'L\'année 2025 marque un tournant majeur dans l\'histoire de l\'intelligence artificielle. Les modèles génératifs comme **GPT-5**, **Claude 3** et **Gemini Ultra** ont atteint des niveaux de sophistication qui dépassent les attentes les plus optimistes des chercheurs.',
        '',
        '### Les technologies qui changent tout',
        '',
        '- **Modèles de langage** : Compréhension contextuelle avancée',
        '- **Génération d\'images** : Création d\'œuvres d\'art photoréalistes',
        '- **Synthèse vocale** : Voix humaines indétectables',
        '- **Code intelligent** : Génération automatique de programmes complexes',
        '',
        '---',
        '',
        '## 💡 Applications pratiques dans le développement web',
        '',
        '### 1. Automatisation du développement frontend',
        '',
        '```javascript',
        '// Exemple de génération automatique de composants React',
        'function generateComponent(prompt) {',
        '  const aiResponse = await openai.createCompletion({',
        '    model: "gpt-5",',
        '    prompt: `Créer un composant React pour: ${prompt}`,',
        '    max_tokens: 500',
        '  });',
        '  return aiResponse.choices[0].text;',
        '}',
        '```',
        '',
        '### 2. Optimisation du CSS moderne',
        '',
        'Les outils d\'IA peuvent maintenant :',
        '',
        '- **Analyser** les designs et générer du CSS optimisé',
        '- **Suggérer** des améliorations d\'accessibilité',
        '- **Créer** des animations fluides et performantes',
        '- **Adapter** automatiquement les layouts pour le responsive',
        '',
        '---',
        '',
        '## 📊 Impact sur l\'industrie tech',
        '',
        '| Secteur | Impact 2024 | Impact 2025 | Évolution |',
        '|---------|-------------|-------------|-----------|',
        '| Développement Web | +15% | +35% | 📈 |',
        '| Design UI/UX | +20% | +45% | 📈 |',
        '| Marketing Digital | +25% | +50% | ⭐ |',
        '| Éducation Tech | +10% | +30% | 📚 |',
        '',
        '---',
        '',
        '## 🎯 Les défis à relever',
        '',
        '### Questions éthiques',
        '',
        '> "L\'IA ne remplacera pas les humains, mais les humains qui utilisent l\'IA remplaceront ceux qui ne l\'utilisent pas."',
        '',
        '1. **Transparence** : Comment expliquer les décisions de l\'IA ?',
        '2. **Biais** : Éviter la reproduction des préjugés humains',
        '3. **Propriété intellectuelle** : Qui possède le contenu généré ?',
        '4. **Emploi** : Comment adapter la formation professionnelle ?',
        '',
        '### Solutions proposées',
        '',
        '- **Formation continue** des développeurs',
        '- **Cadres éthiques** pour le développement d\'IA',
        '- **Collaboration** humain-machine plutôt que remplacement',
        '- **Réglementation** adaptée et évolutive',
        '',
        '---',
        '',
        '## 🔮 L\'avenir du développement web',
        '',
        '### Tendances 2025-2030',
        '',
        '1. **Développement assisté par IA**',
        '   - Génération automatique de code',
        '   - Debugging intelligent',
        '   - Optimisation continue',
        '',
        '2. **Interfaces conversationnelles**',
        '   - Chatbots avancés',
        '   - Assistants vocaux intégrés',
        '   - Navigation par commandes naturelles',
        '',
        '3. **Personnalisation extrême**',
        '   - Interfaces adaptatives',
        '   - Contenu dynamique',
        '   - Expériences uniques',
        '',
        '---',
        '',
        '## 🛠️ Outils recommandés pour 2025',
        '',
        '### Éditeurs de code intelligents',
        '',
        '- **GitHub Copilot** : Assistant de programmation',
        '- **Tabnine** : Autocomplétion IA',
        '- **Kite** : Documentation contextuelle',
        '- **IntelliCode** : Suggestions Microsoft',
        '',
        '### Plateformes de design',
        '',
        '- **Figma AI** : Génération de composants',
        '- **Adobe Firefly** : Création d\'images',
        '- **Canva AI** : Design assisté',
        '- **Midjourney** : Art génératif',
        '',
        '---',
        '',
        '## 📚 Ressources pour approfondir',
        '',
        '### Livres essentiels',
        '',
        '- [**"L\'IA pour les développeurs"**](https://example.com) par Sarah Chen',
        '- [**"Le futur du travail"**](https://example.com) par Marc Dubois',
        '- [**"Éthique et IA"**](https://example.com) par Dr. Marie Laurent',
        '',
        '### Formations en ligne',
        '',
        '- **Coursera** : Spécialisation IA générative',
        '- **Udemy** : Maîtrise des outils IA',
        '- **OpenClassrooms** : Développement avec IA',
        '- **MIT OpenCourseWare** : Fondamentaux de l\'IA',
        '',
        '---',
        '',
        '## 🤖 Exemple pratique : Créer un chatbot IA',
        '',
        '```python',
        'import openai',
        'import streamlit as st',
        '',
        'def create_chatbot():',
        '    st.title("🤖 Assistant IA Personnel")',
        '    ',
        '    # Configuration',
        '    openai.api_key = st.secrets["openai_key"]',
        '    ',
        '    # Interface utilisateur',
        '    user_input = st.text_input("Posez votre question :")',
        '    ',
        '    if user_input:',
        '        response = openai.ChatCompletion.create(',
        '            model="gpt-4",',
        '            messages=[{"role": "user", "content": user_input}]',
        '        )',
        '        st.write("**Réponse :**", response.choices[0].message.content)',
        '```',
        '',
        '---',
        '',
        '## 🌟 Conclusion',
        '',
        'L\'IA générative n\'est ni une simple évolution ni une révolution brutale, mais une **transformation progressive** qui redéfinit notre relation avec la technologie. Les développeurs qui embrassent ces changements aujourd\'hui seront les architectes de demain.',
        '',
        '> **Le futur appartient à ceux qui apprennent à danser avec les machines.**',
        '',
        '---',
        '',
        '*Article rédigé avec l\'aide de l\'IA générative pour démontrer ses capacités de création de contenu technique de qualité.*',
        '',
        '**Tags :** #IA #Technologie #Développement #Innovation #Futur'
    ].join('\n');
    if (savedMarkdown) {
        setEditorContent(savedMarkdown);
    } else {
        setEditorContent(demoText);
    }
    setupEventListeners();
    handleDocumentTitle();
}

/**
 * Affiche le HTML dans l'éditeur
 */
function setEditorContent(markdown) {
    wysiwygEditor.innerHTML = marked.parse(markdown);
}

/**
 * Récupère le Markdown depuis le HTML
 */
function getMarkdownFromEditor() {
    return turndownService.turndown(wysiwygEditor.innerHTML);
}

/**
 * Met à jour la prévisualisation
 */
function updatePreview() {
    const markdown = editor.textContent;
    const html = parseMarkdown(markdown);
    // Si tu veux afficher la prévisualisation ailleurs, ajoute ici
    highlightAllCodeBlocks();
    saveToLocalStorage();
}

/**
 * Synchronise le défilement entre l'éditeur et la prévisualisation
 */
function syncScroll() {
    // Rien à synchroniser sans preview
    return;
}

/**
 * Sauvegarde le contenu dans localStorage
 */
export function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, getMarkdownFromEditor());
}

/**
 * Charge le contenu du document (depuis la base, le localStorage ou vide)
 */
async function loadContent() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('id');
    const currentId = documentId.value;
    const lastId = localStorage.getItem('last_document_id');

    // Cas 1 : Un id est présent dans l'URL (document existant)
    if (urlId) {
        if (lastId !== urlId) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(TITLE_KEY);
        }
        localStorage.setItem('last_document_id', urlId);
        try {
            const response = await fetch(`../php/save_document.php?id=${encodeURIComponent(urlId)}`);
            const data = await response.json();
            if (data && data.success && data.document) {
                setEditorContent(data.document.contenu_markdown || '');
                documentTitle.textContent = data.document.titre || 'Sans titre';
                updatePreview();
                return;
            }
        } catch (e) {
            setEditorContent('');
            documentTitle.textContent = 'Sans titre';
            updatePreview();
            return;
        }
    }

    // Cas 2 : Pas d'id (nouveau document ou brouillon)
    localStorage.setItem('last_document_id', '');
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedTitle = localStorage.getItem(TITLE_KEY);
    if (saved) {
        setEditorContent(saved);
        if (savedTitle) {
            documentTitle.textContent = savedTitle;
        } else {
            documentTitle.textContent = 'Sans titre';
        }
        updatePreview();
    } else {
        setEditorContent('');
        documentTitle.textContent = 'Introduction';
        updatePreview();
    }
}

/**
 * Efface le contenu et réinitialise le titre
 */
function clearContent() {
    if (confirm('Voulez-vous vraiment effacer tout le contenu ?')) {
        editor.textContent = '';
        updatePreview();
        localStorage.removeItem(STORAGE_KEY);
        // Réinitialise aussi le titre
        documentTitle.textContent = 'Sans titre';
        localStorage.removeItem(TITLE_KEY);
    }
}


/**
 * Insère du texte à la position du curseur dans le div contenteditable
 */
export function insertMarkdownAtSelection(insertion) {
    // Insère le markdown à la position du curseur dans le contenu brut
    const markdown = localStorage.getItem(STORAGE_KEY) || editor.textContent;
    const selection = window.getSelection();
    let cursorPos = editor.textContent.length;
    if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        // Calcul de la position du curseur dans le texte brut
        const preRange = document.createRange();
        preRange.selectNodeContents(editor);
        preRange.setEnd(range.startContainer, range.startOffset);
        cursorPos = preRange.toString().length;
    }
    const newMarkdown = markdown.slice(0, cursorPos) + insertion + markdown.slice(cursorPos);
    localStorage.setItem(STORAGE_KEY, newMarkdown); // Sauvegarde immédiate
    setEditorContent(newMarkdown);
    editor.focus();
    updatePreview();
}

/**
 * Affiche une notification temporaire
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}





// Fonction pour créer la popup du tableau
// function createTablePopup() {
//     const overlay = document.createElement('div');
//     overlay.className = 'popup-overlay';
    
//     const popup = document.createElement('div');
//     popup.className = 'table-popup';
//     popup.innerHTML = `
//         <h3>Créer un tableau</h3>
//         <div class="input-group">
//             <div class="input-field">
//                 <label for="rows">Nombre de lignes</label>
//                 <input type="number" id="rows" min="1" max="10" value="3">
//             </div>
//             <div class="input-field">
//                 <label for="cols">Nombre de colonnes</label>
//                 <input type="number" id="cols" min="1" max="10" value="3">
//             </div>
//         </div>
//         <div class="buttons">
//             <button class="cancel">Annuler</button>
//             <button class="confirm">Créer</button>
//         </div>
//     `;

//     document.body.appendChild(overlay);
//     document.body.appendChild(popup);

//     // Gestionnaires d'événements
//     popup.querySelector('.cancel').addEventListener('click', () => {
//         overlay.remove();
//         popup.remove();
//     });

//     popup.querySelector('.confirm').addEventListener('click', () => {
//         const rows = parseInt(popup.querySelector('#rows').value);
//         const cols = parseInt(popup.querySelector('#cols').value);
//         insertTable(rows, cols);
//         overlay.remove();
//         popup.remove();
//     });
// }

// Fonction pour insérer le tableau en Markdown
// function insertTable(rows, cols) {
//     let tableMarkdown = '\n';
//     // Entêtes
//     tableMarkdown += '|';
//     for (let i = 0; i < cols; i++) {
//         tableMarkdown += ` Colonne ${i + 1} |`;
//     }
//     tableMarkdown += '\n|';
//     // Séparateur
//     for (let i = 0; i < cols; i++) {
//         tableMarkdown += '---|';
//     }
//     tableMarkdown += '\n';
//     // Lignes
//     for (let row = 0; row < rows; row++) {
//         tableMarkdown += '|';
//         for (let col = 0; col < cols; col++) {
//             tableMarkdown += '   |';
//         }
//         tableMarkdown += '\n';
//     }
//     // Insérer le tableau à la position du curseur
//     const cursorPos = editor.textContent.length;
//     const newMarkdown = editor.textContent.slice(0, cursorPos) + tableMarkdown + editor.textContent.slice(cursorPos);
//     setEditorContent(newMarkdown);
//     editor.focus();
//     updatePreview();
// }





// Fonction utilitaire pour insérer du texte à la position du curseur
function insertAtCursor(insertion, start, end, text) {
    editor.textContent = text.substring(0, start) + insertion + text.substring(end);
    editor.focus();
    const newCursorPos = start + insertion.length;
    editor.setSelectionRange(newCursorPos, newCursorPos);
    updatePreview();
}

// Initialisation de l'éditeur au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Initialisation de l'éditeur existante
    initEditor();
    const coverContainer = document.getElementById('cover-container');
    const coverImage = document.getElementById('cover-image');
    const coverPlaceholder = document.getElementById('cover-placeholder');
    const coverRemove = document.getElementById('cover-remove');
    // Charger l'image de couverture depuis le localStorage
    const savedCover = localStorage.getItem(COVER_KEY);
    if (savedCover && coverImage) {
        coverImage.src = savedCover;
        coverImage.style.display = 'block';
        if (coverPlaceholder) coverPlaceholder.style.display = 'none';
        if (coverRemove) coverRemove.style.display = 'flex';
    }
    if (coverContainer) {
        coverContainer.addEventListener('click', async (e) => {
            // Ne pas ouvrir la popup si on clique sur la croix
            if (e.target === coverRemove) return;
            const module = await import('./image.js');
            module.createLinkPopup(true).then(markdown => {
                // Extraire l'URL de l'image du markdown ![alt](url)
                const match = /!\[[^\]]*\]\(([^)]+)\)/.exec(markdown);
                if (match && match[1]) {
                    coverImage.src = match[1];
                    coverImage.style.display = 'block';
                    if (coverPlaceholder) coverPlaceholder.style.display = 'none';
                    if (coverRemove) coverRemove.style.display = 'flex';
                    localStorage.setItem(COVER_KEY, match[1]);
                }
            }).catch(() => {});
        });
    }
    if (coverRemove) {
        coverRemove.addEventListener('click', (e) => {
            e.stopPropagation();
            coverImage.src = '';
            coverImage.style.display = 'none';
            if (coverPlaceholder) coverPlaceholder.style.display = 'block';
            coverRemove.style.display = 'none';
            localStorage.removeItem(COVER_KEY);
        });
    }
});

// Fonction pour appliquer le formatage HTML sur la sélection
function insertHtmlFormat(type) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    let node;
    switch(type) {
        case 'bold':
            node = document.createElement('strong');
            break;
        case 'italic':
            node = document.createElement('em');
            break;
        case 'underline':
            node = document.createElement('u');
            break;
        case 'highlight':
            node = document.createElement('mark');
            break;
        case 'code':
            node = document.createElement('code');
            break;
        case 'h1':
            node = document.createElement('h1');
            break;
        case 'h2':
            node = document.createElement('h2');
            break;
        case 'h3':
            node = document.createElement('h3');
            break;
        case 'blockquote':
            node = document.createElement('blockquote');
            break;
        default:
            node = document.createElement('span');
    }
    node.textContent = selection.toString() || 'texte';
    range.deleteContents();
    range.insertNode(node);
    // Place le curseur après le formatage
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}
