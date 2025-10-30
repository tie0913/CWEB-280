const request = require('supertest')
const app = require('../../src/app')

module.exports = {
    post: async (url, body, cookie) => {
        const req = request(app).post(url).send(body).set('Accept', 'application/json')
        if(cookie){
            req.set('Cookie', cookie)
        }
        return await req
    },

    get: async (url, cookie) => {
        const req = request(app).get(url).set('Accept', 'application/json')
        if(cookie){
            req.set('Cookie', cookie)
        }
        return await req
    },

    del: async (url, cookie) => {
        const req = request(app).delete(url) .set('Accept', 'application/json')
        if(cookie){
            req.set('Cookie', cookie)
        }
        return await req
    }
}