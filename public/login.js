// Gestion du formulaire de connexion
(function() {
    // Vérifier si nous sommes sur la page de connexion
    const isLoginPage = document.querySelector('.join-container') !== null && 
                       document.querySelector('form[action="/login"]') !== null;
    
    if (!isLoginPage) return;
    
    const pseudoInput = document.querySelector('input[name="pseudo"]');
    
    // Auto-focus sur le champ pseudo
    if (pseudoInput) {
        pseudoInput.focus();
    }
})();