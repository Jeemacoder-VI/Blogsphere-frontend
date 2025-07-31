// Fonction pour créer la popup de lien
function createLinkPopup(isImage = false) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    const popup = document.createElement('div');
    // Remplacer la classe 'table-popup' par 'image-popup'
    popup.className = 'image-popup';
    popup.innerHTML = `
        <h3>Insérer ${isImage ? 'une image' : 'un lien'}</h3>
        ${isImage ? `
        <div class="input-group">
            <label>Source de l'image</label>
            <div class="source-buttons">
                <button type="button" class="source-btn active" data-source="url">URL</button>
                <button type="button" class="source-btn" data-source="file">Fichier local</button>
            </div>
        </div>
        <div id="urlInput" class="input-section">
            <label for="linkUrl">URL de l'image</label>
            <input type="text" id="linkUrl" placeholder="https://...">
        </div>
        <div id="fileInput" class="input-section" style="display:none;">
            <label for="imageFile">Sélectionner une image</label>
            <input type="file" id="imageFile" accept="image/*">
        </div>
        <label for="altText">Texte alternatif</label>
        <input type="text" id="altText" placeholder="Description de l'image">
        <div class="dimensions-group">
            <div class="input-field half">
                <label for="imgWidth">Largeur (px)</label>
                <input type="number" id="imgWidth" placeholder="auto">
            </div>
            <div class="input-field half">
                <label for="imgHeight">Hauteur (px)</label>
                <input type="number" id="imgHeight" placeholder="auto">
            </div>
        </div>
        ` : `
        <div class="input-group">
            <label for="linkText">Texte du lien</label>
            <input type="text" id="linkText" placeholder="Texte à afficher">
            <label for="linkUrl">URL du lien</label>
            <input type="text" id="linkUrl" placeholder="https://...">
        </div>
        `}
        <div class="buttons">
            <button class="cancel">Annuler</button>
            <button class="confirm">Insérer</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    if (isImage) {
        const sourceButtons = popup.querySelectorAll('.source-btn');
        const urlInput = popup.querySelector('#urlInput');
        const fileInput = popup.querySelector('#fileInput');

        sourceButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                sourceButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (btn.dataset.source === 'url') {
                    urlInput.style.display = 'block';
                    fileInput.style.display = 'none';
                } else {
                    urlInput.style.display = 'none';
                    fileInput.style.display = 'block';
                }
            });
        });
    }

    return new Promise((resolve, reject) => {
        popup.querySelector('.cancel').addEventListener('click', () => {
            overlay.remove();
            popup.remove();
            reject();
        });

        popup.querySelector('.confirm').addEventListener('click', async () => {
            let url = '';
            let markdown = '';
            
            if (isImage) {
                const imageFile = popup.querySelector('#imageFile');
                const alt = popup.querySelector('#altText').value || '';
                const width = popup.querySelector('#imgWidth').value;
                const height = popup.querySelector('#imgHeight').value;
                
                if (popup.querySelector('.source-btn.active').dataset.source === 'file' && imageFile.files[0]) {
                    // Lecture du fichier local en base64
                    const file = imageFile.files[0];
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        url = e.target.result;
                        // Markdown avec data URL
                        markdown = `![${alt}](${url})<!-- dimensions:${width}:${height} -->`;
                        overlay.remove();
                        popup.remove();
                        resolve(markdown);
                    };
                    reader.readAsDataURL(file);
                    return; // On sort, le reste est inutile
                } else {
                    url = popup.querySelector('#linkUrl').value;
                }
                markdown = `![${alt}](${url})<!-- dimensions:${width}:${height} -->`;
            } else {
                const text = popup.querySelector('#linkText').value || '';
                url = popup.querySelector('#linkUrl').value;
                markdown = `[${text}](${url})`;
            }
            
            overlay.remove();
            popup.remove();
            resolve(markdown);
        });
    });
}



// Fonction pour afficher une notification
function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

export { createLinkPopup };