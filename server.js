import { Server } from "socket.io";
import { createServer } from "http";
import 'dotenv/config';

const users = new Map();

export function startServer(app, prisma, port = process.env.PORT || 3000) {
    const server = createServer(app);
    const io = new Server(server);

    // Test connexion BDD
    prisma.$connect()
        .then(() => console.log('✅ Connexion BDD réussie'))
        .catch(err => {
            console.error('❌ Erreur BDD:', err);
            setTimeout(() => prisma.$connect(), 5000);
        });

    // Socket.IO
    io.on('connection', (socket) => {
        // Utilisateur rejoint
        socket.on('user join', (username) => {
            users.set(socket.id, username);
            socket.broadcast.emit('user connected', { username });
            io.emit('user count', users.size);
        });

        // Message reçu
        socket.on('chat message', async (data) => {
            const username = users.get(socket.id);
            if (!username) return;

            try {
                const savedMessage = await prisma.message.create({
                    data: { pseudo: username, content: data.message }
                });

                io.emit('chat message', {
                    username,
                    message: data.message,
                    createdAt: savedMessage.createdAt
                });
            } catch (error) {
                console.error('Erreur sauvegarde:', error);
                io.emit('chat message', {
                    username,
                    message: data.message,
                    createdAt: new Date()
                });
            }
        });

        // Utilisateur déconnecté
        socket.on('disconnect', () => {
            const username = users.get(socket.id);
            if (username) {
                users.delete(socket.id);
                socket.broadcast.emit('user disconnected', { username });
                io.emit('user count', users.size);
            }
        });
    });

    // Démarrage serveur
    server.listen(port, () => {
        console.log(`🚀 Chat: http://127.0.0.1:${port}/join`);
    });

    // Nettoyage
    const cleanup = () => {
        prisma.$disconnect();
    };
    
    process.on('SIGINT', () => { cleanup(); process.exit(0); });
    process.on('SIGTERM', () => { cleanup(); process.exit(0); });

    return { server, io };
}