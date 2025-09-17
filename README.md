# Chat App - Version 3

Une application de chat en temps réel avec authentification sécurisée, sessions et interface moderne utilisant Socket.IO, Prisma et PostgreSQL.

## 🆕 Nouvelles fonctionnalités V3

- � **Authentification sécurisée** : Système de connexion avec pseudo/mot de passe
- 🍪 **Sessions Express** : Gestion des sessions avec cookies sécurisés et httpOnly
- �️ **Sécurité renforcée** : Configuration CORS, proxy de confiance, cookies adaptatifs
- 🎨 **Interface moderne** : Design completement refait avec dégradés et animations
- 📱 **Responsive design** : Interface adaptée mobile et desktop
- 🚪 **Déconnexion** : Bouton de déconnexion avec confirmation
- ⚙️ **Variables d'environnement** : Configuration via FRONT_URL, SESSION_SECRET
- � **Protection des routes** : Redirection automatique si non connecté

## Fonctionnalités

- 💬 Chat en temps réel avec Socket.IO
- � Authentification sécurisée avec pseudo/mot de passe
- 🍪 Gestion des sessions Express avec cookies sécurisés
- � Compteur d'utilisateurs connectés en temps réel
- 🎨 Interface utilisateur moderne et responsive
- 💾 Messages persistants avec PostgreSQL et Prisma
- ⏰ Horodatage français des messages
- 🚪 Système de déconnexion avec confirmation
- 🛡️ Protection CSRF et configuration CORS
- 📱 Design adaptatif mobile/desktop

## Technologies

- **Backend**: Node.js + Express.js avec sessions
- **Base de données**: PostgreSQL avec Prisma ORM
- **Templating**: Twig avec templates sécurisés
- **WebSocket**: Socket.IO v4.8.1
- **Frontend**: HTML5 sémantique + CSS3 moderne avec variables CSS
- **Sécurité**: Express-session, CORS, cookies httpOnly
- **Tests**: Jest + Supertest (tests unitaires) + Playwright (tests E2E)
- **Déploiement**: Render.com avec configuration proxy

## Installation

```bash
npm install
```

## Configuration

1. Créer un fichier `.env` avec vos variables d'environnement :
```bash
DATABASE_URL="your_postgresql_connection_string"
FRONT_URL="http://localhost:3000"                    # URL du frontend (https en production)
SESSION_SECRET="votre-clé-secrète-très-sécurisée"   # Clé pour les sessions
NODE_ENV="development"                               # Ou "production"
```

2. Générer le client Prisma :
```bash
npx prisma generate
```

3. Appliquer les migrations :
```bash
npx prisma db push
```

4. Créer un utilisateur de test (optionnel) :
```bash
node createTestUsers.js
```

## Lancement

```bash
npm start
```

L'application sera accessible sur http://localhost:3000/join

## Sécurité

- **Sessions sécurisées** : Cookies httpOnly avec expiration de 24h
- **Protection CSRF** : Configuration sameSite adaptée à l'environnement
- **CORS configuré** : Origines autorisées selon FRONT_URL
- **Proxy de confiance** : Support des déploiements avec reverse proxy
- **Cookies adaptatifs** : Secure automatique en HTTPS

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
├── index.js              # Serveur Express + Socket.IO + Prisma + Sessions
├── server.js             # Configuration Socket.IO et serveur HTTP
├── package.json          # Dépendances (ajout express-session)
├── .env                  # Variables d'environnement sécurisées
├── createTestUsers.js    # Script de création d'utilisateurs de test
├── prisma/
│   └── schema.prisma     # Schéma de base de données avec utilisateurs
├── generated/prisma/     # Client Prisma généré
├── tests/                # Tests unitaires et E2E avec authentification
│   ├── routes.test.js    # Tests des routes HTTP avec sessions
│   ├── socket.test.js    # Tests Socket.IO
│   └── session.e2e.test.js # Tests E2E avec processus de connexion
├── e2e/                  # Tests Playwright
├── public/
│   ├── style.css         # Styles CSS modernes avec variables CSS
│   └── main.js           # JavaScript côté client avec validation
└── views/
    ├── index.twig        # Interface de chat avec bouton déconnexion
    └── join.twig         # Page de connexion sécurisée
```

## Utilisation

1. Accéder à http://localhost:3000 
2. Redirection automatique vers `/join` si non connecté
3. Saisir vos identifiants (pseudo et mot de passe)
4. Connexion automatique avec création de session sécurisée
5. Commencer à chatter dans l'interface moderne !
6. Utiliser le bouton "Déconnexion" pour terminer la session
7. Les messages sont automatiquement sauvegardés et l'historique s'affiche au chargement

## Déploiement sur Render

1. Connecter votre repository GitHub à Render
2. Configurer les variables d'environnement :
   - `DATABASE_URL` : URL de votre base PostgreSQL
   - `FRONT_URL` : URL HTTPS de votre application (ex: https://monapp.onrender.com)
   - `SESSION_SECRET` : Clé secrète sécurisée pour les sessions
   - `NODE_ENV` : "production"
3. Render exécutera automatiquement `npm run build` puis `npm start`
4. Les cookies seront automatiquement sécurisés en HTTPS

## Version

**Version 3** - Application complète avec authentification sécurisée et interface moderne

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
- **V3** :
  - ✅ Système d'authentification sécurisé avec pseudo/mot de passe
  - ✅ Gestion des sessions Express avec cookies httpOnly
  - ✅ Configuration CORS et proxy de confiance
  - ✅ Interface utilisateur moderne avec design responsive
  - ✅ Variables CSS et dégradés pour un style uniforme
  - ✅ Bouton de déconnexion avec confirmation
  - ✅ Protection des routes et redirection automatique
  - ✅ Tests E2E mis à jour avec processus de connexion
  - ✅ Cookies adaptatifs selon l'environnement (dev/prod)
  - ✅ Validation JavaScript côté client
