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
    test('Session utilisateur complète : connexion, envoi et réception de messages', async () => {
        // Aller à la page de connexion
        await page.goto(`http://localhost:${testPort}/join`);
        
        // Vérifier que nous sommes sur la page de connexion
        await page.waitForSelector('h1:has-text("Connexion au Chat")', { timeout: 10000 });
        
        // Entrer le pseudo et le mot de passe
        await page.waitForSelector('input[name="pseudo"]', { timeout: 10000 });
        await page.fill('input[name="pseudo"]', 'Donzaud');
        
        await page.waitForSelector('input[name="password"]', { timeout: 10000 });
        await page.fill('input[name="password"]', '*963.');
        
        // Cliquer sur le bouton de connexion
        await page.click('button[type="submit"]:has-text("Se connecter")');

        // Attendre d'être redirigé vers le chat (page d'accueil)
        await page.waitForURL(`**/`, { timeout: 10000 });
        
        // Vérifier que nous sommes bien connectés (présence du nom d'utilisateur dans l'interface)
        await page.waitForSelector('text=Utilisateur: Donzaud', { timeout: 10000 });
        
        // Attendre que la page de chat soit chargée
        await page.waitForSelector('#messageInput', { timeout: 10000 });
        await page.waitForSelector('#sendBtn', { timeout: 10000 });

        // Envoyer un message
        const message = 'Message de test fait le ' + new Date().toISOString();
        await page.fill('#messageInput', message);
        await page.click('#sendBtn');

        // Vérifier que le message apparaît dans la liste des messages
        await page.waitForSelector(`text=${message}`, { timeout: 10000 });

        // Vérifier que l'élément contenant le message existe et est visible
        const messageElement = await page.locator(`text=${message}`).first();
        expect(await messageElement.isVisible()).toBe(true);
        
        // Vérifier que le champ de saisie est vidé après envoi
        const inputValue = await page.inputValue('#messageInput');
        expect(inputValue).toBe('');
        
        // Test de déconnexion
        await page.waitForSelector('#logoutBtn', { timeout: 5000 });
        await page.click('#logoutBtn');
        
        // Confirmer la déconnexion dans la boîte de dialogue
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Êtes-vous sûr de vouloir vous déconnecter');
            await dialog.accept();
        });
        
        // Attendre d'être redirigé vers la page de connexion
        await page.waitForURL(`**/join`, { timeout: 10000 });
        
        // Vérifier que nous sommes bien de retour sur la page de connexion
        await page.waitForSelector('h1:has-text("Connexion au Chat")', { timeout: 5000 });

    }, 60000);
    
    test('Échec de connexion avec identifiants incorrects', async () => {
        // Aller à la page de connexion
        await page.goto(`http://localhost:${testPort}/join`);
        
        // Vérifier que nous sommes sur la page de connexion
        await page.waitForSelector('h1:has-text("Connexion au Chat")', { timeout: 10000 });
        
        // Entrer des identifiants incorrects
        await page.fill('input[name="pseudo"]', 'WrongUser');
        await page.fill('input[name="password"]', 'wrongpassword');
        
        // Cliquer sur le bouton de connexion
        await page.click('button[type="submit"]:has-text("Se connecter")');
        
        // Vérifier que le message d'erreur apparaît
        await page.waitForSelector('.error-message', { timeout: 10000 });
        
        const errorMessage = await page.textContent('.error-message');
        expect(errorMessage).toContain('Pseudo ou mot de passe incorrect');
        
        // Vérifier que nous sommes toujours sur la page de connexion
        const currentUrl = page.url();
        expect(currentUrl).toContain('/join');
        
    }, 30000);
    
    test('Redirection automatique vers /join si non connecté', async () => {
        // Essayer d'accéder directement à la page de chat sans être connecté
        await page.goto(`http://localhost:${testPort}/`);
        
        // Vérifier que nous sommes automatiquement redirigés vers /join
        await page.waitForURL(`**/join`, { timeout: 10000 });
        
        // Vérifier que nous sommes bien sur la page de connexion
        await page.waitForSelector('h1:has-text("Connexion au Chat")', { timeout: 5000 });
        
    }, 30000);
});