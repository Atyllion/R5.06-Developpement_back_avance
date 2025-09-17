// Ce fichier ne contient plus que la logique de détection de page
// La logique spécifique à chaque page a été déplacée vers des fichiers séparés :
// - login.js : Gestion du formulaire de connexion
// - register.js : Gestion du formulaire d'inscription  
// - chat.js : Gestion du chat et de Socket.IO

// Vérifier si nous sommes sur la page de connexion, inscription ou de chat
const isLoginPage = document.querySelector('.join-container') !== null && document.querySelector('form[action="/login"]') !== null;
const isRegisterPage = document.querySelector('.join-container') !== null && document.querySelector('form[action="/register"]') !== null;
const isChatPage = !isLoginPage && !isRegisterPage;

// Afficher des informations de debug en mode développement
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Page détectée:', {
        isLoginPage,
        isRegisterPage, 
        isChatPage
    });
}