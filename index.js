import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config';
import { PrismaClient } from './generated/prisma/index.js';
import { startServer } from './server.js';

// Prisma Client
const prisma = new PrismaClient();

// Équivalent de __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration Express
const app = express();

// Configuration du moteur de template
app.set('view engine', 'twig');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// === ROUTES ===

// Route principale - Chat
app.get('/', async (req, res) => {
    if (!req.query.username) {
        return res.redirect('/join');
    }
    
    try {
        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' },
            take: 50
        });
        
        res.render('index', { 
            username: req.query.username,
            messages: messages 
        });
    } catch (error) {
        console.error('Erreur récupération messages:', error);
        res.render('index', { 
            username: req.query.username,
            messages: [] 
        });
    }
});

// Route de connexion
app.get('/join', (req, res) => {
    res.render('join');
});

// === DÉMARRAGE DU SERVEUR (uniquement si pas en mode test) ===
let server, io;

if (process.env.NODE_ENV !== 'test') {
    const serverInstance = startServer(app, prisma);
    server = serverInstance.server;
    io = serverInstance.io;
}

// Exports pour les tests
export { app, server as httpServer, io, prisma, startServer };