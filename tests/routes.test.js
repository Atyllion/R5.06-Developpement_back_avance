import request from 'supertest';
import { app } from '../index.js';

describe('Test des routes HTTP', () => {
    test('GET /join doit retourner le formulaire de connexion', async () => {
        const response = await request(app).get('/join');
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/text\/html/);
        expect(response.text).toMatch(/<!DOCTYPE html>/);
    });

    test('GET / sans username doit rediriger vers /join', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/join');
    });

    test('GET / avec username doit retourner la page de chat', async () => {
        const response = await request(app).get('/?username=TestUser');
        expect(response.status).toBe(200);
        expect(response.text).toMatch(/<!DOCTYPE html>/);
    });
});