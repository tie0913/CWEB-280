const request = require('supertest')
const app = require('../../src/app')

module.exports = {
    post: (url, body, cookie) => {
        const req = request(app).post(url).send(body).set('Accept', 'application/json')
        if(cookie){
            req.set('Cookie', cookie)
        }
        return req
    },

    get: (url, cookie) => {
        const req = request(app).get(url).set('Accept', 'application/json')
        if(cookie){
            req.set('Cookie', cookie)
        }
        return req
    }
}