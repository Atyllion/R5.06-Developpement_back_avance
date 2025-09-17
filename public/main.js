// Configuration et variables globales
// Vérifier si nous sommes sur la page de connexion ou de chat
const isLoginPage = document.querySelector('.join-container') !== null;

// Gestion du formulaire de connexion
if (isLoginPage) {
    const loginForm = document.querySelector('form[action="/login"]');
    const pseudoInput = document.querySelector('input[name="pseudo"]');
    const passwordInput = document.querySelector('input[name="password"]');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // Validation côté client
            const pseudo = pseudoInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!pseudo) {
                e.preventDefault();
                alert('Veuillez saisir un pseudo');
                pseudoInput.focus();
                return;
            }
            
            if (!password) {
                e.preventDefault();
                alert('Veuillez saisir un mot de passe');
                passwordInput.focus();
                return;
            }
            
            if (pseudo.length < 3) {
                e.preventDefault();
                alert('Le pseudo doit contenir au moins 3 caractères');
                pseudoInput.focus();
                return;
            }
        });
        
        // Auto-focus sur le champ pseudo
        if (pseudoInput) {
            pseudoInput.focus();
        }
    }
}

// Code pour la page de chat
if (!isLoginPage) {
    const socket = io();
    const messagesList = document.getElementById('messagesList');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const userCount = document.getElementById('userCount');
    const logoutBtn = document.getElementById('logoutBtn');

    // Récupérer le nom d'utilisateur depuis l'attribut data
    const username = document.body.getAttribute('data-username');

    // Gestion de la déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Confirmer la déconnexion
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                // Redirection vers la route de déconnexion
                window.location.href = '/logout';
            }
        });
    }

/**
 * Ajoute un message à la liste des messages
 * @param {Object} data - Données du message
 */
function addMessage(data) {
    const li = document.createElement('li');
    li.className = 'message';
    
    if (data.type === 'system') {
        li.className += ' system-message';
        li.textContent = data.message;
    } else {
        if (data.username === username) {
            li.className += ' own-message';
        } else {
            li.className += ' other-message';
        }
        
        const header = document.createElement('span');
        header.className = 'message-header';
        header.textContent = data.username;
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = data.message;
        
        const time = document.createElement('small');
        time.className = 'message-time';
        if (data.createdAt) {
            time.textContent = new Date(data.createdAt).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else {
            time.textContent = new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
        li.appendChild(header);
        li.appendChild(content);
        li.appendChild(time);
    }
    
    messagesList.appendChild(li);
    messagesList.scrollTop = messagesList.scrollHeight;
}

/**
 * Envoie un message via Socket.IO
 */
function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chat message', { message: message });
        messageInput.value = '';
    }
}

// Gestion des événements Socket.IO
socket.on('chat message', addMessage);

socket.on('user connected', (data) => {
    addMessage({ 
        type: 'system', 
        message: data.username + ' a rejoint' 
    });
});

socket.on('user disconnected', (data) => {
    addMessage({ 
        type: 'system', 
        message: data.username + ' a quitté' 
    });
});

socket.on('user count', (count) => {
    userCount.textContent = count;
});

socket.on('connect', () => {
    socket.emit('user join', username);
});

// Gestion des événements DOM
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Auto-focus sur le champ de saisie
messageInput.focus();

} // Fin du bloc pour la page de chat
