import { highlightAllCodeBlocks } from './highlight-init.js';
/**
 * Convertit le texte Markdown en HTML
 */
function parseMarkdown(markdown) {
    // On protège d'abord les blocs de code pour ne pas les altérer
    const codeBlocks = [];
    let html = markdown.replace(/```([a-z]*)\n([\s\S]*?)```/gm, function(match, lang, code) {
        codeBlocks.push({ lang, code });
        return `@@CODEBLOCK${codeBlocks.length - 1}@@`;
    });

    // Protéger les tableaux pour les traiter ensemble
    // const tables = [];
    // html = html.replace(/^[|].*[|]$[\n](?:[|][-|\s]*[|][\n])?(?:[|].*[|][\n]?)*$/gm, function(match) {
    //     tables.push(match);
    //     return `@@TABLE${tables.length - 1}@@`;
    // });

    // Gestion de l'indentation visuelle (hors code)
    html = html.replace(/^(\s{2,})(.+)$/gm, function(match, indent, content) {
        const paddingLeft = indent.length * 10;
        return `<div style="padding-left: ${paddingLeft}px">${content}</div>`;
    });

    // Gestion des blockquotes multi-lignes avec '>>' (double chevron)
    html = html.replace(/(^|\n)>> ?([\s\S]+?)(?=\n{2,}|$)/g, function(match, p1, content) {
        // On prend toutes les lignes suivantes jusqu'à une ligne vide ou la fin
        // On retire les éventuels chevrons simples au début des lignes suivantes
        const cleaned = content.replace(/^> ?/gm, '').replace(/\n/g, '<br>');
        return `${p1}<blockquote>${cleaned}</blockquote>`;
    });

    // Règles de conversion Markdown
    html = html
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/==(.*?)==/g, '<mark>$1</mark>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Regroupement correct des listes numérotées Markdown
        .replace(/^(\d+)\.\s(.*)$/gm, '<li>$2</li>')
        .replace(/(<li>.*?<\/li>\n?)+/g, function(match) {
            // On ne regroupe que les blocs de <li> consécutifs
            // Vérifie qu'il s'agit bien d'une liste numérotée (en amont)
            return '<ol>' + match.replace(/\n/g, '') + '</ol>\n';
        })
        .replace(/^\s*[-*]\s(.*)$/gm, '<li data-type="unordered">$1</li>')
        .replace(/(<li data-type="unordered">.*<\/li>(\n|$))+?/gm, function(match) {
            return '<ul>' + match.replace(/\s*data-type="unordered"\s*/g, '') + '</ul>';
        })
        .replace(/^>(.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)(?:<!-- dimensions:(\d*):(\d*) -->)?/g, function(match, alt, src, width, height) {
            let attrs = `src="${src}" alt="${alt}"`;
            if (width) attrs += ` width="${width}px"`;
            if (height) attrs += ` height="${height}px"`;
            return `<img ${attrs}>`;
        })
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Gestion des tableaux améliorée
    // function parseTable(tableContent) { ... } // SUPPRIMÉ

    // Traitement des tableaux
    // html = html.replace(/@@TABLE(\d+)@@/g, function(_, idx) {
    //     return parseTable(tables[idx]);
    // });

    // Restaure les blocs de code protégés
    html = html.replace(/@@CODEBLOCK(\d+)@@/g, function(_, idx) {
        const { lang, code } = codeBlocks[idx];
        const language = lang ? ` class="language-${lang}"` : ' class="language-plaintext"';
        return `<pre><code${language}>${code.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</code></pre>`;
    });

    // Gestion des paragraphes (après tout le reste)
    html = html.replace(/^(?!<[uhlt]|<li)(.+)$/gm, '<p>$1</p>');

    setTimeout(() => highlightAllCodeBlocks(), 0);
    return html;
}

export { parseMarkdown };