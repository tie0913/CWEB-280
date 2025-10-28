const request = require('supertest')
const app = require('../src/app')
const { logHttp } = require('./httpReporter');

describe('POST /auth/signIn', () => {
    it('should sign in successfully and get cookie', async () => {

        const t0 = Date.now();
        const payload = {
            email:'wangtie_913@outlook.com',
            password:'123456'
        }

        const res = await request(app).post('/api/v1/auth/signIn')
        .send(payload).set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)

        expect(res.body).toHaveProperty('code', 0)

        const cookies = res.headers['set-cookie']
        expect(Array.isArray(cookies)).toBe(true)
        expect(cookies[0]).toMatch(/pictionary_user/)
        
        const durationMs = Date.now() - t0;
        logHttp({
            testName: 'POST /auth/signIn success',
            method: 'POST',
            url: '/auth/signIn',
            reqBody: payload,
            status: res.status,
            resHeaders: { 'set-cookie': res.headers['set-cookie'] },
            resBody: res.body,
            durationMs
        });

        /*
        const cookieHeader = cookies.join(';')
        const protectedRes = await request(app)
        .get('/api/v1/users/self'
            .set('Cookie', cookieHeader)
            .expect(200)
        )*/
    })
})