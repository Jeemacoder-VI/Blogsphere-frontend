// Gestion des blocs de code avec coloration syntaxique
export function insertCodeBlock() {
    const languages = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'php', label: 'PHP' },
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'sql', label: 'SQL' },
        { value: 'java', label: 'Java' },
        { value: 'csharp', label: 'C#' },
        { value: 'cpp', label: 'C++' },
        { value: 'ruby', label: 'Ruby' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'swift', label: 'Swift' },
        { value: 'kotlin', label: 'Kotlin' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'json', label: 'JSON' },
        { value: 'xml', label: 'XML' },
        { value: 'yaml', label: 'YAML' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'bash', label: 'Bash' },
        { value: 'powershell', label: 'PowerShell' },
        { value: 'dockerfile', label: 'Dockerfile' },
        { value: 'gitignore', label: '.gitignore' },
        { value: 'plaintext', label: 'Texte brut' }
    ];

    // Créer le popup
    const popup = document.createElement('div');
    popup.className = 'code-block-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #007bff;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        min-width: 400px;
        max-width: 600px;
    `;

    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #333;">Insérer un bloc de code</h3>
            <button id="closeCodePopup" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666;">&times;</button>
        </div>
        
        <div style="margin-bottom: 15px;">
            <label for="languageSelect" style="display: block; margin-bottom: 5px; font-weight: 500; color: #555;">Langage :</label>
            <select id="languageSelect" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
                ${languages.map(lang => `<option value="${lang.value}">${lang.label}</option>`).join('')}
            </select>
        </div>
        
        <div style="margin-bottom: 15px;">
            <label for="codeContent" style="display: block; margin-bottom: 5px; font-weight: 500; color: #555;">Code :</label>
            <textarea id="codeContent" placeholder="Entrez votre code ici..." style="width: 100%; height: 200px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="cancelCodeBtn" style="padding: 8px 16px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 6px; cursor: pointer;">Annuler</button>
            <button id="insertCodeBtn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">Insérer</button>
        </div>
    `;

    document.body.appendChild(popup);

    // Focus sur le textarea
    const textarea = popup.querySelector('#codeContent');
    textarea.focus();

    // Gestionnaires d'événements
    const closeBtn = popup.querySelector('#closeCodePopup');
    const cancelBtn = popup.querySelector('#cancelCodeBtn');
    const insertBtn = popup.querySelector('#insertCodeBtn');
    const languageSelect = popup.querySelector('#languageSelect');

    function closePopup() {
        document.body.removeChild(popup);
    }

    closeBtn.addEventListener('click', closePopup);
    cancelBtn.addEventListener('click', closePopup);

    insertBtn.addEventListener('click', () => {
        const language = languageSelect.value;
        const code = textarea.value.trim();
        
        if (code) {
            const markdown = `\`\`\`${language}\n${code}\n\`\`\``;
            
            // Insérer dans l'éditeur
            const editor = document.getElementById('editor');
            const selection = window.getSelection();
            
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const textNode = document.createTextNode(markdown);
                range.deleteContents();
                range.insertNode(textNode);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                // Insérer à la fin si aucune sélection
                editor.focus();
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                const textNode = document.createTextNode(markdown);
                range.insertNode(textNode);
            }
            
            // Appliquer la coloration syntaxique
            applySyntaxHighlighting();
        }
        
        closePopup();
    });

    // Fermer avec Escape
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closePopup();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

// Appliquer la coloration syntaxique
export function applySyntaxHighlighting() {
    const editor = document.getElementById('editor');
    if (!editor) return;

    // Trouver tous les blocs de code
    const codeBlocks = editor.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        // Vérifier si highlight.js n'a pas déjà été appliqué
        if (!block.classList.contains('hljs')) {
            hljs.highlightElement(block);
        }
    });
}

// Détecter et formater automatiquement les blocs de code
export function autoFormatCodeBlocks() {
    const editor = document.getElementById('editor');
    if (!editor) return;

    const content = editor.innerHTML;
    
    // Regex pour détecter les blocs de code Markdown
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    
    if (codeBlockRegex.test(content)) {
        // Convertir le Markdown en HTML avec coloration
        const htmlContent = marked.parse(content, {
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        console.error('Erreur de coloration syntaxique:', err);
                    }
                }
                return hljs.highlightAuto(code).value;
            }
        });
        
        editor.innerHTML = htmlContent;
    }
}

// Initialiser la coloration syntaxique
export function initSyntaxHighlighting() {
    // Appliquer la coloration sur le contenu existant
    applySyntaxHighlighting();
    
    // Observer les changements dans l'éditeur
    const editor = document.getElementById('editor');
    if (editor) {
        const observer = new MutationObserver(() => {
            applySyntaxHighlighting();
        });
        
        observer.observe(editor, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
} 