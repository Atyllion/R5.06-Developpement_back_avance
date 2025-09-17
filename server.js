import { Server } from "socket.io";
import { createServer } from "http";
import 'dotenv/config';

const users = new Map();

export function startServer(app, prisma, port = process.env.PORT || 3000) {
    const server = createServer(app);
    const io = new Server(server);

    // Test connexion BDD avec retry intelligent
    const connectToDatabase = async (retries = 5) => {
        try {
            await prisma.$connect();
            console.log('✅ Connexion BDD réussie');
            return true;
        } catch (err) {
            console.error(`❌ Erreur BDD (tentative ${6-retries}/5):`, err.message);
            if (retries > 0) {
                console.log(`🔄 Retry dans 5 secondes... (${retries} tentatives restantes)`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return connectToDatabase(retries - 1);
            } else {
                console.error('💥 Impossible de se connecter à la BDD après 5 tentatives');
                return false;
            }
        }
    };
    
    // Connexion à la BDD au démarrage
    connectToDatabase();

    // Socket.IO
    io.on('connection', (socket) => {
        console.log(`🔌 Nouvelle connexion: ${socket.id}`);

        // Utilisateur rejoint
        socket.on('user join', (username) => {
            users.set(socket.id, username);
            socket.broadcast.emit('user connected', { username });
            io.emit('user count', users.size);
            console.log(`👤 ${username} a rejoint (${users.size} utilisateurs connectés)`);
        });

        // Message reçu
        socket.on('chat message', async (data) => {
            const username = users.get(socket.id);
            if (!username) return;

            console.log(`💬 Message de ${username}: ${data.message}`);

            try {
                // Essayer de sauvegarder en BDD
                const savedMessage = await prisma.message.create({
                    data: { pseudo: username, content: data.message }
                });

                io.emit('chat message', {
                    username,
                    message: data.message,
                    createdAt: savedMessage.createdAt
                });
                
            } catch (error) {
                console.error('❌ Erreur sauvegarde message:', error.message);
                // Continuer le service même en cas d'erreur BDD
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
                console.log(`👋 ${username} a quitté (${users.size} utilisateurs connectés)`);
            }
        });
    });

    // Démarrage serveur
    server.listen(port, () => {
        console.log(`🚀 Chat en ligne: http://127.0.0.1:${port}/join`);
        console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Port: ${port}`);
    });

    // Nettoyage gracieux
    const cleanup = async () => {
        console.log('🛑 Arrêt du serveur...');
        try {
            await prisma.$disconnect();
            console.log('✅ Prisma déconnecté proprement');
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion Prisma:', error);
        }
    };
    
    process.on('SIGINT', () => { cleanup(); process.exit(0); });
    process.on('SIGTERM', () => { cleanup(); process.exit(0); });

    return { server, io };
}