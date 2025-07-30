// Correction pour enregistrement.js
class ArticleSaver {
    constructor() {
        this.saveBtn = document.getElementById('saveBtn');
        this.draftBtn = document.getElementById('draftBtn');
        this.documentId = document.getElementById('documentId');
        this.documentTitle = document.getElementById('documentTitle');
        this.editor = document.getElementById('editor');
        this.coverImage = document.getElementById('cover-image');
        
        this.init();
    }

    init() {
        // Vérifier si l'utilisateur est connecté
        this.checkUserSession();
        
        // Écouter le clic sur le bouton sauvegarder
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => this.saveArticle(false)); // Publier
        }
        
        // Écouter le clic sur le bouton brouillon
        if (this.draftBtn) {
            this.draftBtn.addEventListener('click', () => this.saveArticle(true)); // Brouillon
        }
    }

    checkUserSession() {
        // Vérifier si l'utilisateur est connecté via une requête AJAX
        fetch('backend/api/check_session.php')
            .then(response => response.json())
            .then(data => {
                if (!data.logged_in) {
                    this.showMessage('Vous devez être connecté pour éditer un article', 'error');
                    setTimeout(() => {
                        window.location.href = 'connexion.php';
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la vérification de session:', error);
                this.showMessage('Erreur de connexion', 'error');
            });
    }

    async saveArticle(isDraft = false) {
        try {
            // Désactiver les boutons pendant la sauvegarde
            const currentBtn = isDraft ? this.draftBtn : this.saveBtn;
            currentBtn.disabled = true;
            currentBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sauvegarde...';

            // Récupérer les données
            let articleData;
            try {
                articleData = await this.getArticleData(isDraft);
            } catch (error) {
                this.showMessage('Erreur lors de la préparation des données: ' + error.message, 'error');
                return;
            }
            
            if (!this.validateData(articleData)) {
                return;
            }

            // Choisir l'endpoint selon si c'est une création ou une mise à jour
            const endpoint = articleData.article_id && articleData.article_id > 0
                ? 'backend/api/save_article.php' 
                : 'backend/api/create_article.php';

            console.log('Utilisation de l\'endpoint:', endpoint);
            console.log('Données envoyées:', articleData);

            // Envoyer les données au serveur
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(articleData)
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage(result.message, 'success');
                
                // Mettre à jour l'ID de l'article si c'était une création
                if (result.article_id) {
                    this.documentId.value = result.article_id;
                }
                
                // Rediriger vers articles.php après 2 secondes
                setTimeout(() => {
                    window.location.href = 'articles.php';
                }, 2000);
            } else {
                this.showMessage(result.message, 'error');
            }

        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showMessage('Erreur lors de la sauvegarde: ' + error.message, 'error');
        } finally {
            // Réactiver les boutons
            this.saveBtn.disabled = false;
            this.saveBtn.innerHTML = '<i class="icon">S</i>';
            this.draftBtn.disabled = false;
            this.draftBtn.innerHTML = '<i class="fa-regular fa-floppy-disk icon"></i>';
        }
    }

    async getArticleData(isDraft = true) {
        const title = this.documentTitle.textContent.trim();
        const content = this.getMarkdownContent();
        const articleId = this.documentId.value;
        const coverImageUrl = this.coverImage.src || null;

        // Validation des données de base
        if (!title || title.length < 3) {
            throw new Error('Le titre doit contenir au moins 3 caractères');
        }

        if (!content || content.length < 10) {
            throw new Error('Le contenu doit contenir au moins 10 caractères');
        }

        // Déterminer si c'est une création ou une mise à jour
        // Si l'ID est 0 ou vide, c'est un nouvel article
        const isNewArticle = !articleId || articleId === '' || articleId === '0';
        
        console.log('Article ID:', articleId);
        console.log('Est un nouvel article:', isNewArticle);

        return {
            title: title,
            content: content,
            article_id: isNewArticle ? null : parseInt(articleId),
            cover_image_url: coverImageUrl,
            is_draft: isDraft,
            syntax_highlighting: true,
            is_new: isNewArticle
        };
    }

    getMarkdownContent() {
        // Récupérer le contenu Markdown depuis l'éditeur
        // Si l'éditeur utilise Turndown pour convertir HTML en Markdown
        if (window.turndownService) {
            return window.turndownService.turndown(this.editor.innerHTML);
        }
        
        // Sinon, retourner le contenu HTML (sera converti côté serveur)
        return this.editor.innerHTML;
    }

    validateData(data) {
        if (!data.title || data.title.length < 3) {
            this.showMessage('Le titre doit contenir au moins 3 caractères', 'error');
            return false;
        }

        if (!data.content || data.content.length < 10) {
            this.showMessage('Le contenu doit contenir au moins 10 caractères', 'error');
            return false;
        }

        return true;
    }

    showMessage(message, type = 'info') {
        // Créer ou réutiliser le conteneur de message
        let messageContainer = document.getElementById('message-container');
        
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'message-container';
            messageContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                padding: 15px 20px;
                border-radius: 8px;
                font-weight: 500;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(messageContainer);
        }

        // Définir les couleurs selon le type
        const colors = {
            success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
            error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
            warning: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' },
            info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }
        };

        const style = colors[type] || colors.info;
        messageContainer.style.backgroundColor = style.bg;
        messageContainer.style.color = style.color;
        messageContainer.style.border = `1px solid ${style.border}`;
        messageContainer.textContent = message;

        // Afficher le message
        messageContainer.style.transform = 'translateX(0)';

        // Masquer le message après 5 secondes
        setTimeout(() => {
            messageContainer.style.transform = 'translateX(100%)';
        }, 5000);
    }

    // Méthode pour uploader une image de couverture
    async uploadCoverImage(file) {
        try {
            const formData = new FormData();
            formData.append('cover_image', file);
            formData.append('article_id', this.documentId.value);

            const response = await fetch('backend/api/upload_cover.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('Image de couverture uploadée avec succès', 'success');
                return result.image_url;
            } else {
                this.showMessage(result.message, 'error');
                return null;
            }

        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            this.showMessage('Erreur lors de l\'upload de l\'image', 'error');
            return null;
        }
    }
}

// Initialiser la classe quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new ArticleSaver();
});

// Exporter pour utilisation dans d'autres modules
export { ArticleSaver };