# Chat App - Version 2

Une application de chat en temps réel avec persistance des données utilisant Socket.IO, Prisma et PostgreSQL.

## 🆕 Nouvelles fonctionnalités V2

- 💾 **Persistance des messages** : Sauvegarde automatique en base de données PostgreSQL
- 📜 **Historique des messages** : Affichage des 50 derniers messages au chargement
- ⏰ **Timestamps** : Affichage de l'heure d'envoi de chaque message
- 🚀 **Prêt pour production** : Configuration optimisée pour Render.com
- 🛡️ **Gestion d'erreurs** : Continuité du service même en cas de problème BDD

## Fonctionnalités

- 💬 Chat en temps réel avec Socket.IO
- 👤 Authentification obligatoire via `/join`
- 📊 Compteur d'utilisateurs connectés
- 🎨 Interface utilisateur simple et responsive
- 💾 Messages persistants avec PostgreSQL
- ⏰ Horodatage des messages

## Technologies

- **Backend**: Node.js + Express.js
- **Base de données**: PostgreSQL avec Prisma ORM
- **Templating**: Twig
- **WebSocket**: Socket.IO v4.8.1
- **Frontend**: HTML5 sémantique + CSS3
- **Tests**: Jest + Supertest (tests unitaires) + Playwright (tests E2E)
- **Déploiement**: Render.com

## Installation

```bash
npm install
```

## Configuration

1. Créer un fichier `.env` avec votre URL de base de données PostgreSQL :
```bash
DATABASE_URL="your_postgresql_connection_string"
```

2. Générer le client Prisma :
```bash
npx prisma generate
```

3. Appliquer les migrations (si nécessaire) :
```bash
npx prisma db push
```

## Lancement

```bash
npm start
```

L'application sera accessible sur http://localhost:3000

## Tests

**Tests unitaires (Jest + Supertest) :**
```bash
npm test
```

**Tests E2E (Playwright) :**
```bash
npm run test:e2e
```

## Structure

```
TP1_Chat/
├── index.js              # Serveur Express + Socket.IO + Prisma
├── package.json          # Dépendances
├── .env                  # Variables d'environnement (DATABASE_URL)
├── prisma/
│   └── schema.prisma     # Schéma de base de données
├── generated/prisma/     # Client Prisma généré
├── tests/                # Tests unitaires et E2E
│   ├── routes.test.js    # Tests des routes HTTP
│   ├── socket.test.js    # Tests Socket.IO
│   └── session.e2e.test.js # Tests end-to-end
├── e2e/                  # Tests Playwright
├── public/
│   └── style.css         # Styles CSS améliorés
└── views/
    ├── index.twig        # Interface de chat avec historique
    └── join.twig         # Page d'authentification
```

## Utilisation

1. Accéder à http://localhost:3000 
2. Redirection automatique vers `/join`
3. Saisir un nom d'utilisateur
4. Commencer à chatter !
5. Les messages sont automatiquement sauvegardés et l'historique s'affiche au chargement

## Déploiement sur Render

1. Connecter votre repository GitHub à Render
2. Configurer les variables d'environnement :
   - `DATABASE_URL` : URL de votre base PostgreSQL
3. Render exécutera automatiquement `npm run build` puis `npm start`

## Version

**Version 2** - Application complète avec persistance des données

### Historique des versions
- **V1** : Chat basique avec authentification simple en mémoire
- **V2** : 
  - ✅ Intégration Prisma + PostgreSQL
  - ✅ Persistance des messages en base de données
  - ✅ Affichage de l'historique des 50 derniers messages
  - ✅ Timestamps sur tous les messages
  - ✅ Gestion d'erreurs robuste
  - ✅ Configuration pour déploiement en production (Render)
  - ✅ Interface utilisateur améliorée
  - ✅ Tests automatisés (Jest + Supertest + Playwright)
