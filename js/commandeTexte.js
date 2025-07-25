// Sélection des boutons et éléments
let optionsBtn = document.querySelectorAll('.option-button');
let avanceOptionButton = document.querySelectorAll('.adv-option-button');
let fontName = document.getElementById('fontName');
let fontSizeRef = document.getElementById('fontSize');
let espaceEcriture = document.getElementById('text-input');
let lienBtn = document.getElementById('createLink');
let alignBtn = document.querySelectorAll('.align');
let espaceBtn = document.querySelectorAll('.espace');
let formatBtn = document.querySelectorAll('.format');
let scriptBtn = document.querySelectorAll('.script');

// Stocker la dernière commande pour appliquer le style sur du nouveau texte
let dernierStyle = null;

// Liste pour les polices de caractères
let fontListe = ['Arial', 'Verdana', 'Times New Roman', 'Garamond', 'Georgia', 'Courier New', 'Cursive'];

// Mapping des tailles de police : index 1 à 7 correspond aux tailles en pixels
let taillePoliceMapping = {
    1: '8px',    // Très petit (équivalent à 8pt)
    2: '10px',   // Petit (équivalent à 10pt)
    3: '12px',   // Normal (équivalent à 12pt)
    4: '14px',   // Grand (équivalent à 14pt)
    5: '18px',   // Très grand (équivalent à 18pt)
    6: '24px',   // Extra grand (équivalent à 24pt)
    7: '36px'    // Gigantesque (équivalent à 36pt)
};

// Les réglages initiaux 
const initialiser = () => {
    surbrillance(alignBtn, true);
    surbrillance(espaceBtn, true);
    surbrillance(formatBtn, false);
    surbrillance(scriptBtn, true);

    fontListe.forEach(value => {
        let option = document.createElement('option');
        option.value = value;
        option.innerHTML = value;
        fontName.appendChild(option);
    });

    for(let i = 1; i <= 7; i++){
        let option = document.createElement('option');
        option.value = i;
        option.innerHTML =  taillePoliceMapping[i]; // Affichage de la taille en pixels;
        fontSizeRef.appendChild(option);
    }
    fontSizeRef.value = 3;
};

// Modifier le texte avec gestion du dernier style appliqué
const modifierText = (command, defaut, value) => {
    if (document.getSelection().isCollapsed) {
        dernierStyle = { command, defaut, value };
    }
    document.execCommand(command, defaut, value);
    verifierEtatBoutons();
};

// Appliquer le dernier style si un utilisateur commence à écrire après avoir cliqué sur un bouton
espaceEcriture.addEventListener('keydown', () => {
    if (dernierStyle) {
        document.execCommand(dernierStyle.command, dernierStyle.defaut, dernierStyle.value);
        dernierStyle = null;
    }
});

// Variable pour stocker le dernier format sélectionné
let dernierFormat = null;

// Écouter les changements dans la liste déroulante des formats
document.getElementById('formatDeFormat').addEventListener('change', (event) => {
    let valeur = event.target.value;
    dernierFormat = valeur; // Stocker le dernier format sélectionné

    // Appliquer le format immédiatement si du texte est sélectionné
    if (!document.getSelection().isCollapsed) {
        document.execCommand('formatBlock', false, `<${valeur}>`);
    }
});

// Appliquer le dernier format lorsque l'utilisateur commence à écrire
espaceEcriture.addEventListener('keydown', () => {
    if (dernierFormat) {
        document.execCommand('formatBlock', false, `<${dernierFormat}>`);
    }
});

optionsBtn.forEach((button) => {
    button.addEventListener('click', () => {
        modifierText(button.id, false, null);
    });
});

avanceOptionButton.forEach((button) => {
    button.addEventListener('change', () => {
        modifierText(button.id, false, button.value);
    });
});

lienBtn.addEventListener('click', () => {
    let lienUtilisateur = prompt('Entrer une URL');
    if (lienUtilisateur) {
        if (!/^https?:\/\//i.test(lienUtilisateur)) {
            lienUtilisateur = 'http://' + lienUtilisateur;
        }
        modifierText('createLink', false, lienUtilisateur);
    }
});

const surbrillance = (className, besoinEnlève) => {
    className.forEach((button) => {
        button.addEventListener('click', () => {
            if (besoinEnlève) {
                let dejaActive = button.classList.contains('active');
                surbrillanceSupprime(className);
                if (!dejaActive) {
                    button.classList.add('active');
                }
            } else {
                button.classList.toggle('active');
            }
        });
    });
};

const surbrillanceSupprime = (className) => {
    className.forEach((button) => button.classList.remove('active'));
};

const verifierEtatBoutons = () => {
    optionsBtn.forEach((button) => {
        let etat = document.queryCommandState(button.id);
        button.classList.toggle('active', etat);

        // Ajouter ou supprimer la classe 'trait-active' pour le span dans le bouton Bold
            let trait = button.querySelector('.trait');
            if (trait) {
                trait.classList.toggle('trait-active', etat);
            }
    });
};

// Barre d'outils rich text : gestion de l'état actif
export function updateToolbarState() {
        const editor = document.getElementById('text-input');
        const buttons = document.querySelectorAll('.option-button, .adv-option-button');
        buttons.forEach(btn => {
            let cmd = btn.id;
            let isActive = false;
            if (cmd === 'bold') isActive = document.queryCommandState('bold');
            if (cmd === 'italic') isActive = document.queryCommandState('italic');
            if (cmd === 'underline') isActive = document.queryCommandState('underline');
            if (cmd === 'strikethrough') isActive = document.queryCommandState('strikethrough');
            if (cmd === 'superscript') isActive = document.queryCommandState('superscript');
            if (cmd === 'subscript') isActive = document.queryCommandState('subscript');
            if (cmd === 'insertOrderedList') isActive = document.queryCommandState('insertOrderedList');
            if (cmd === 'insertUnorderedList') isActive = document.queryCommandState('insertUnorderedList');
            if (cmd === 'justifyLeft') isActive = document.queryCommandState('justifyLeft');
            if (cmd === 'justifyCenter') isActive = document.queryCommandState('justifyCenter');
            if (cmd === 'justifyRight') isActive = document.queryCommandState('justifyRight');
            if (cmd === 'justifyFull') isActive = document.queryCommandState('justifyFull');
            if (isActive) {
                btn.classList.add('active-btn');
            } else {
                btn.classList.remove('active-btn');
            }
        });
    }
    const editor = document.getElementById('text-input');
    if (editor) {
        editor.addEventListener('keyup', updateToolbarState);
        editor.addEventListener('mouseup', updateToolbarState);
        editor.addEventListener('focus', updateToolbarState);
        editor.addEventListener('blur', updateToolbarState);
    }


window.onload = () => {
    initialiser();
    verifierEtatBoutons();
};

document.addEventListener('selectionchange', verifierEtatBoutons);
