export function updateSummary() {
  const form = document.getElementById("editionForm");
  const previewBtn = document.querySelector(".previsualisation");

  previewBtn.addEventListener("click", function (e) {
    e.preventDefault();

    // 🧹 Supprimer toute popup déjà existante
    const oldPopup = document.querySelector(".preview-popup");
    if (oldPopup) oldPopup.remove();

    // Créer le résumé dynamiquement
    const summary = document.createElement("div");
    summary.className = "summary";

    const contentHtml =
      form.querySelector('input[name="contentHtml"]')?.value || "";

    summary.innerHTML = `
        <div class="article-header">
                <h1>Comment créer une interface responsive moderne en 2025</h1>
                <div class="article-meta">
                    <div class="author-info">
                        <img src="assets/image.png" alt="Photo de profil" class="author-avatar">
                        <div class="author-details">
                            <span class="author-name">Mahamane Korobara</span>
                            <time datetime="2025-07-24">24 juillet 2025</time>
                        </div>
                    </div>
                    <div class="article-tags">
                        <span class="tag">Design</span>
                        <span class="tag">Web</span>
                        <span class="tag">CSS</span>
                    </div>
                </div>
                <img src="assets/image.png" alt="Image de couverture" class="cover-image">
            </div>

            <div class="article-content">
                <p>Créer une interface responsive moderne est essentiel pour offrir une expérience utilisateur optimale sur tous les appareils. En 2025, les tendances privilégient la simplicité, la rapidité et l’accessibilité. Utilisez des grilles CSS flexibles, des polices lisibles et des couleurs douces pour capter l’attention sans surcharger l’écran.</p>
                
                <h2>Les étapes clés pour réussir</h2>
                <ul>
                    <li><strong>1. Utiliser Flexbox et Grid :</strong> Ces outils permettent de structurer facilement vos pages et de les adapter à toutes les résolutions.</li>
                    <li><strong>2. Prioriser le mobile :</strong> Concevez d’abord pour les petits écrans, puis enrichissez pour le desktop (approche mobile-first).</li>
                    <li><strong>3. Optimiser les images :</strong> Servez des images légères et adaptées à la taille de l’écran pour accélérer le chargement.</li>
                    <li><strong>4. Tester l’accessibilité :</strong> Vérifiez la lisibilité, le contraste et la navigation au clavier pour tous les utilisateurs.</li>
                </ul>
                <h2>Bonnes pratiques de design</h2>
                <p>Privilégiez les espaces blancs, les boutons arrondis et les animations douces pour rendre la navigation agréable. Inspirez-vous des sites populaires et adaptez les tendances à votre identité visuelle. N’oubliez pas d’intégrer des fonctionnalités interactives comme le mode sombre, les notifications ou les transitions fluides.</p>
                <blockquote>“Un bon design, c’est celui qui se fait oublier et laisse place au contenu.”</blockquote>
            </div>
    `;

    // Créer et afficher la popup
    const popup = document.createElement("div");
    popup.className = "preview-popup";

    const article = document.createElement("article");
    article.className = "blog-article";
    article.innerHTML = summary.innerHTML;

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-preview";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => {
      popup.remove();
      document.body.style.overflow = "";
    };

    article.appendChild(closeBtn);
    popup.appendChild(article);
    document.body.appendChild(popup);
    document.body.style.overflow = "hidden";
  });
}
