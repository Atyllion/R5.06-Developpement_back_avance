# Chat App - Version 2

Une application de chat en temps réel simple utilisant Socket.IO et Twig.

## Fonctionnalités

- 💬 Chat en temps réel avec Socket.IO
- 👤 Authentification obligatoire via `/join`
- 📊 Compteur d'utilisateurs connectés
- 🎨 Interface utilisateur simple et responsive

## Technologies

- **Backend**: Node.js + Express.js
- **Templating**: Twig
- **WebSocket**: Socket.IO v4.8.1
- **Frontend**: HTML5 sémantique + CSS3

## Installation

```bash
npm install
```

## Lancement

```bash
npm start
```

L'application sera accessible sur http://localhost:3000

## Structure

```
TP1_Chat/
├── index.js          # Serveur Express + Socket.IO
├── package.json      # Dépendances
├── public/
│   └── style.css     # Styles CSS
└── views/
    ├── index.twig    # Interface de chat
    └── join.twig     # Page d'authentification
```

## Utilisation

1. Accéder à http://localhost:3000 
2. Redirection automatique vers `/join`
3. Saisir un nom d'utilisateur
4. Commencer à chatter !

## Version

**Version 2** - Améliorations et nouvelles fonctionnalités (en cours de développement)

### Historique des versions
- **V1** : Chat basique avec authentification simple
- **V2** : Nouvelles fonctionnalités à venir...
