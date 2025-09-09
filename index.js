import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config';
import { PrismaClient } from './generated/prisma/index.js';

// Prisma Client
const prisma = new PrismaClient();

// Équivalent de __dirname et __filename en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

// Configuration
app.set('view engine', 'twig');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Variables
let users = new Map();

// Routes
app.get('/', async function (req, res) {
    if (!req.query.username) {
        return res.redirect('/join');
    }
    
    // Récupérer les derniers messages de la BDD
    try {
        const messages = await prisma.message.findMany({
            orderBy: {
                createdAt: 'asc'
            },
            take: 50 // Limiter à 50 derniers messages
        });
        
        res.render('index', { 
            username: req.query.username,
            messages: messages 
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        res.render('index', { 
            username: req.query.username,
            messages: [] 
        });
    }
});

app.get('/join', function (req, res) {
    res.render('join');
});

// Socket.IO
io.on('connection', (socket) => {
    socket.on('user join', (username) => {
        users.set(socket.id, username);
        socket.broadcast.emit('user connected', { username });
        io.emit('user count', users.size);
    });
    
    socket.on('chat message', async (data) => {
        const username = users.get(socket.id);
        if (username) {
            try {
                // Sauvegarder le message en BDD
                const savedMessage = await prisma.message.create({
                    data: {
                        pseudo: username,
                        content: data.message
                    }
                });
                
                // Diffuser le message à tous les clients
                io.emit('chat message', {
                    username: username,
                    message: data.message,
                    createdAt: savedMessage.createdAt
                });
            } catch (error) {
                console.error('Erreur lors de la sauvegarde du message:', error);
                // En cas d'erreur, diffuser quand même le message
                io.emit('chat message', {
                    username: username,
                    message: data.message
                });
            }
        }
    });
    
    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        if (username) {
            users.delete(socket.id);
            socket.broadcast.emit('user disconnected', { username });
            io.emit('user count', users.size);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
   console.log(`Chat en ligne: http://127.0.0.1:${PORT}/join`);
})