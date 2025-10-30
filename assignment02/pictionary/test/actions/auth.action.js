const api = require('./network.client')


exports.signIn = async (email, password) => {
    const response = await api.post('/api/v1/auth/signIn', {email, password})
    const cookies = response.headers['set-cookie']
    return {cookies, body:response.body}
}


exports.signOut = async(cookie) => {
    const response = await api.post('/api/v1/auth/signOut', {}, cookie)
    return response.body
}


exports.signUp = async(name, password, email) => {
    const response = await api.post('/api/v1/auth/signUp', {name, password, email})
    return response.body
}

exports.deleteAccount = async(cookie) => {
    const response = await api.post('/api/v1/auth/deleteAccount', {}, cookie)
    return response.body
}