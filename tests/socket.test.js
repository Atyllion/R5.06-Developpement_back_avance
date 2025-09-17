import { io as Client } from "socket.io-client";
import { app, startServer, prisma } from "../index.js";

let clientSocket;
let serverInstance;
let httpServer;
let io;
const testPort = 3001;

beforeAll((done) => {
    // Configurer l'environnement de test
    process.env.NODE_ENV = 'test';
    
    // Démarrer le serveur pour les tests
    serverInstance = startServer(app, prisma, testPort);
    httpServer = serverInstance.server;
    io = serverInstance.io;
    
    // Attendre que le serveur soit prêt
    setTimeout(() => {
        console.log(`Serveur de test démarré sur le port ${testPort}`);
        done();
    }, 1000);
});

afterAll((done) => {
    if (clientSocket?.connected) {
        clientSocket.disconnect();
    }
    
    if (httpServer) {
        httpServer.close(() => {
            console.log('Serveur de test fermé');
            done();
        });
    } else {
        done();
    }
});

describe("Test des sockets", () => {
    test("Connexion et déconnexion d'un utilisateur", (done) => {
        clientSocket = new Client(`http://localhost:${testPort}`);

        clientSocket.on("connect", () => {
            // Simuler la connexion d'un utilisateur
            clientSocket.emit("user join", "TestUser");
            
            // Écouter la confirmation
            clientSocket.on("user count", (count) => {
                expect(count).toBe(1);
                clientSocket.disconnect();
                done();
            });
        });

        clientSocket.on("connect_error", (error) => {
            console.error("Erreur de connexion:", error);
            done(error);
        });
    });

    test("Envoi et réception de message", (done) => {
        clientSocket = new Client(`http://localhost:${testPort}`);

        clientSocket.on("connect", () => {
            // Rejoindre en tant qu'utilisateur
            clientSocket.emit("user join", "TestUser2");
            
            // Écouter les messages
            clientSocket.on("chat message", (data) => {
                expect(data.username).toBe("TestUser2");
                expect(data.message).toBe("Hello, test!");
                expect(data.createdAt).toBeDefined();
                clientSocket.disconnect();
                done();
            });

            // Envoyer un message après être connecté
            setTimeout(() => {
                clientSocket.emit("chat message", { message: "Hello, test!" });
            }, 100);
        });

        clientSocket.on("connect_error", (error) => {
            console.error("Erreur de connexion:", error);
            done(error);
        });
    });
});