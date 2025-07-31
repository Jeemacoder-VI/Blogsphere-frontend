import { saveToLocalStorage } from './edition.js';

// Fonctions d'insertion HTML pour WYSIWYG
export function formatBold() {
    insertHtmlTag('strong');
    saveToLocalStorage();
}
export function formatItalic() {
    insertHtmlTag('em');
    saveToLocalStorage();
}
export function formatUnderline() {
    insertHtmlTag('u');
    saveToLocalStorage();
}
export function formatHighlight() {
    insertHtmlTag('mark');
    saveToLocalStorage();
}
export function formatCode() {
    insertHtmlTag('code');
    saveToLocalStorage();
}
export function formatH1() {
    insertHtmlTag('h1');
    saveToLocalStorage();
}
export function formatH2() {
    insertHtmlTag('h2');
    saveToLocalStorage();
}
export function formatH3() {
    insertHtmlTag('h3');
    saveToLocalStorage();
}
export function formatBlockquote() {
    insertHtmlTag('blockquote');
    saveToLocalStorage();
}
export function formatList(type = 'ul') {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const list = document.createElement(type);
    const li = document.createElement('li');
    li.textContent = selection.toString() || 'élément';
    list.appendChild(li);
    range.deleteContents();
    range.insertNode(list);
    range.setStartAfter(list);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    saveToLocalStorage();
}
export function formatLink() {
    const url = prompt('URL du lien :', 'https://');
    if (!url) return;
    insertHtmlTag('a', url);
    saveToLocalStorage();
}
export function formatImage() {
    const url = prompt('URL de l’image :', 'https://');
    if (!url) return;
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const img = document.createElement('img');
    img.src = url;
    img.alt = selection.toString() || 'image';
    range.deleteContents();
    range.insertNode(img);
    range.setStartAfter(img);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    saveToLocalStorage();
}
// Utilitaire générique
function insertHtmlTag(tag, href = null) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    if (!selectedText) return;
    let node;
    // Toggle du formatage
    if (tag === 'strong' || tag === 'em' || tag === 'u' || tag === 'mark' || tag === 'code') {
        // Si la sélection est déjà dans le tag, on retire le formatage
        const parent = range.startContainer.parentNode;
        if (parent.nodeName.toLowerCase() === tag) {
            // Remplace le parent par son contenu brut
            const textNode = document.createTextNode(parent.textContent);
            parent.parentNode.replaceChild(textNode, parent);
            range.selectNodeContents(textNode);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            return;
        }
    }
    node = document.createElement(tag);
    if (tag === 'a' && href) node.href = href;
    node.textContent = selectedText || (tag === 'a' ? href : 'texte');
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}
