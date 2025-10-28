const api = require('./network.client')


exports.signIn = async (email, password) => {
    const response = await api.post('/api/v1/auth/signIn', {email, password}).expect(200)
    const cookies = response.headers['set-cookie']
    return {cookies, body:response.body}
}


exports.signOut = async(cookie) => {
    const response = await api.post('/api/v1/auth/signOut', {}, cookie).expect(200)
    return response.body
}


exports.signUp = async(name, password, email) => {
    const response = await api.post('/api/v1/auth/signUp', {name, password, email}).expect(200)
    return response.body
}

exports.deleteAccount = async(cookie) => {
    const response = await api.post('/api/v1/auth/deleteAccount', {}, cookie).expect(200)
    return response.body
}