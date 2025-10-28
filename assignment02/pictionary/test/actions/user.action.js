const {post, get} = require('./network.client')

exports.self = async (cookie) => {
    const response = await get('/api/v1/users/self', cookie)
    return response.body
}


exports.list = async(cookie) => {
    const response = await get('/api/v1/users/list', cookie)
    return response.body
}