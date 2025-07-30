// Initialisation de highlight.js
// Utilisation du CDN : highlight.js doit être chargé dans le <head> du HTML
// <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">

export function highlightAllCodeBlocks() {
    if (window.hljs) {
        document.querySelectorAll('pre code').forEach(block => {
            window.hljs.highlightElement(block);
            // Correction stricte : on force le style du projet
            block.style.lineHeight = '1.7';
            block.style.fontSize = '1.05rem';
            block.style.fontFamily = "'Consolas', monospace";
        });
    }
}

// On applique toujours le thème highlight.js clair
const id = 'hljs-theme-style';
let link = document.getElementById(id);
if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = id;
    document.head.appendChild(link);
}
link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';

// Pour usage direct dans le navigateur (si besoin)
window.highlightAllCodeBlocks = highlightAllCodeBlocks;
