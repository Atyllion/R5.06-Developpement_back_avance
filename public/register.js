// Gestion du formulaire d'inscription
(function() {
    // Vérifier si nous sommes sur la page d'inscription
    const isRegisterPage = document.querySelector('.join-container') !== null && 
                          document.querySelector('form[action="/register"]') !== null;
    
    if (!isRegisterPage) return;
    
    const pseudoInput = document.querySelector('input[name="pseudo"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
    
    // Auto-focus sur le champ pseudo
    if (pseudoInput) {
        pseudoInput.focus();
    }
    
    // Validation en temps réel pour la confirmation de mot de passe
    if (passwordInput && confirmPasswordInput) {
        function validatePasswordMatch() {
            if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity('Les mots de passe ne correspondent pas');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        }
        
        passwordInput.addEventListener('input', validatePasswordMatch);
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
})();