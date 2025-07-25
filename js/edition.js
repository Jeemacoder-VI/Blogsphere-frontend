import { updateToolbarState } from './commandeTexte.js';
import { updateSummary } from './publication.js';

document.addEventListener('DOMContentLoaded', function() {
    const steps = document.querySelectorAll('.step');
    let currentStep = 0;

    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.toggle('step-active', i === index);
        });
    }
    showStep(currentStep);

    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
                updateSummary();
            }
        });
    });
    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
                updateSummary();
            }
        });
    });

    // Preview image de couverture
    const coverInput = document.querySelector('input[name="cover"]');
    const coverPreview = document.querySelector('.cover-preview');
    coverInput && coverInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                coverPreview.innerHTML = `<img src='${ev.target.result}' alt='Aperçu'>`;
            };
            reader.readAsDataURL(file);
        } else {
            coverPreview.innerHTML = '';
        }
    });

    // Preview avatar
    const avatarInput = document.querySelector('input[name="avatar"]');
    const avatarPreview = document.querySelector('.avatar-preview');
    avatarInput && avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                avatarPreview.innerHTML = `<img src='${ev.target.result}' alt='Avatar'>`;
            };
            reader.readAsDataURL(file);
        } else {
            avatarPreview.innerHTML = '';
        }
    });

    // Résumé avant publication
    updateSummary();

    document.getElementById('editionForm').addEventListener('input', updateSummary);
    updateSummary();

    // Publication (simulation)
    document.getElementById('editionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Article publié avec succès !');
        window.location.href = 'articles.html';
    });

    // Mise à jour de l'état de la barre d'outils
    updateToolbarState();
    
});
