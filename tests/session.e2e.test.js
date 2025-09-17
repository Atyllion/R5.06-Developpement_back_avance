import { chromium } from 'playwright';
import { app, startServer, prisma } from '../index.js';

let browser, page;
let serverInstance;
let httpServer;
const testPort = 3002;

beforeAll(async () => {
    // Configurer l'environnement de test
    process.env.NODE_ENV = 'test';
    
    // Démarrer le serveur sur un port de test
    serverInstance = startServer(app, prisma, testPort);
    httpServer = serverInstance.server;
    
    // Attendre que le serveur soit prêt
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Lancer le navigateur
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();
}, 30000);

afterAll(async () => {
    if (browser) {
        await browser.close();
    }
    if (httpServer) {
        await new Promise((resolve) => httpServer.close(resolve));
    }
}, 30000);

describe('Session utilisateur', () => {
    test('Session utilisateur complète : envoie et réception de messages', async () => {
        // Aller à la page de connexion
        await page.goto(`http://localhost:${testPort}/join`);
        
        // Entrer un pseudo 
        await page.waitForSelector('input[name="username"]', { timeout: 10000 });
        await page.fill('input[name="username"]', 'TestUser');
        await page.click('button[type="submit"]');

        // Attendre d'être redirigé vers le chat
        await page.waitForURL(`**/?username=TestUser`, { timeout: 10000 });
        
        // Attendre que la page de chat soit chargée
        await page.waitForSelector('#messageInput', { timeout: 10000 });

        // Envoyer un message
        const message = 'Hello, this is a test message!';
        await page.fill('#messageInput', message);
        await page.click('#sendBtn');

        // Vérifier que le message apparaît dans la liste des messages
        await page.waitForSelector(`text=${message}`, { timeout: 10000 });

        // Vérifier que l'élément contenant le message existe
        const messageElement = await page.locator(`text=${message}`).first();
        expect(await messageElement.isVisible()).toBe(true);

    }, 45000);
});