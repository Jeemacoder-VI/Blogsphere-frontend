class WYSIWYGEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.turndownService = new TurndownService();
        
        // Configuration de marked pour le parsing Markdown
        marked.setOptions({
            breaks: true,
            gfm: true
        });

        // Configuration de Turndown pour la conversion HTML → Markdown
        this.turndownService.addRule('preserveIndentation', {
            filter: ['pre', 'code'],
            replacement: function(content) {
                return '\n```\n' + content + '\n```\n';
            }
        });

        this.setupEventListeners();
        this.setupMarkdownShortcuts();
    }

    setupEventListeners() {
        this.editor.addEventListener('input', this.handleInput.bind(this));
        this.editor.addEventListener('keydown', this.handleKeydown.bind(this));
        this.editor.addEventListener('paste', this.handlePaste.bind(this));
    }

    setupMarkdownShortcuts() {
        const shortcuts = {
            '#': this.handleHeading.bind(this),
            '*': this.handleBoldItalic.bind(this),
            '_': this.handleBoldItalic.bind(this),
            '`': this.handleCode.bind(this),
            '>': this.handleBlockquote.bind(this),
            '-': this.handleList.bind(this),
            '1': this.handleOrderedList.bind(this)
        };

        this.editor.addEventListener('keyup', (e) => {
            if (e.key === ' ') {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;

                const range = selection.getRangeAt(0);
                const line = this.getLineContent(range.startContainer);
                const firstChar = line.trim()[0];

                if (shortcuts[firstChar]) {
                    shortcuts[firstChar](line, range);
                }
            }
        });
    }

    handleInput(e) {
        // Ici on peut ajouter une logique spécifique pour l'input si nécessaire
    }

    handleKeydown(e) {
        if (e.key === 'Enter') {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const block = this.getClosestBlock(range.startContainer);
            
            if (block && block.tagName === 'LI') {
                if (block.textContent.trim() === '') {
                    e.preventDefault();
                    this.exitList(block);
                }
            }
        }
    }

    handlePaste(e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        const html = marked(text);
        document.execCommand('insertHTML', false, html);
    }

    // Conversion du contenu
    getMarkdown() {
        return this.turndownService.turndown(this.editor.innerHTML);
    }

    setContent(markdown) {
        this.editor.innerHTML = marked(markdown);
    }

    // Helpers pour les shortcuts
    getLineContent(node) {
        const range = document.createRange();
        range.selectNodeContents(this.getClosestBlock(node));
        return range.toString();
    }

    getClosestBlock(node) {
        while (node && node !== this.editor) {
            if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE'].includes(node.nodeName)) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    // Gestionnaires de formatage
    handleHeading(line, range) {
        const level = line.match(/^#{1,6}/)[0].length;
        const text = line.replace(/^#{1,6}\s/, '');
        const tag = `h${level}`;
        
        this.replaceLineWithTag(range, tag, text);
    }

    handleBoldItalic(line, range) {
        // Implémentation du gras/italique selon les marqueurs * ou _
    }

    handleCode(line, range) {
        if (line.startsWith('```')) {
            this.replaceLineWithTag(range, 'pre', line.replace(/^```/, ''));
        } else if (line.startsWith('`')) {
            this.replaceLineWithTag(range, 'code', line.replace(/^`/, ''));
        }
    }

    handleBlockquote(line, range) {
        if (line.startsWith('>')) {
            this.replaceLineWithTag(range, 'blockquote', line.replace(/^>\s?/, ''));
        }
    }

    handleList(line, range) {
        if (line.startsWith('- ')) {
            this.createList(range, 'ul', line.replace(/^-\s/, ''));
        }
    }

    handleOrderedList(line, range) {
        if (line.match(/^\d+\.\s/)) {
            this.createList(range, 'ol', line.replace(/^\d+\.\s/, ''));
        }
    }

    // Méthodes utilitaires pour le formatage
    replaceLineWithTag(range, tag, content) {
        const block = this.getClosestBlock(range.startContainer);
        if (!block) return;

        const newElement = document.createElement(tag);
        newElement.textContent = content;
        block.parentNode.replaceChild(newElement, block);
        
        // Place le curseur à la fin
        const selection = window.getSelection();
        range = document.createRange();
        range.setStartAfter(newElement);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    createList(range, type, content) {
        const block = this.getClosestBlock(range.startContainer);
        if (!block) return;

        const list = document.createElement(type);
        const item = document.createElement('li');
        item.textContent = content;
        list.appendChild(item);
        block.parentNode.replaceChild(list, block);

        // Place le curseur dans le li
        const selection = window.getSelection();
        range = document.createRange();
        range.setStartAfter(item.firstChild);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    exitList(listItem) {
        const list = listItem.parentNode;
        const paragraph = document.createElement('p');
        paragraph.innerHTML = '<br>';
        
        if (listItem.nextSibling) {
            list.removeChild(listItem);
        } else {
            list.parentNode.insertBefore(paragraph, list.nextSibling);
            list.removeChild(listItem);
            if (!list.hasChildNodes()) {
                list.parentNode.removeChild(list);
            }
        }

        // Place le curseur dans le nouveau paragraphe
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStartAfter(paragraph);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// Export de la classe
export default WYSIWYGEditor;
