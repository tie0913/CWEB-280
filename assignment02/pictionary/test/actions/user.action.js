const {post, get} = require('./network.client')

exports.self = async (cookie) => {
    const response = await get('/api/v1/users/self', cookie)
    return response.body
}

exports.selfUpdate = async (user, cookie) => {
    const response = await post('/api/v1/users/self', user, cookie)
    return response.body
}

exports.list = async(cookie) => {
    const response = await get('/api/v1/users/list', cookie)
    return response.body
}

exports.listBannedUsers = async(name, cookie) => {
    const response = await get(`/api/v1/users/list?filter[name]=${name}`, cookie)
    return response.body
}


exports.getUserForAdmin = async(user_id, cookie) => {
    const response = await get('/api/v1/users/get/' + user_id, cookie)
    return response.body
}

exports.patch = async(user, cookie) => {
    const response = await post('/api/v1/users/patch', user, cookie)
    return response.body
}

exports.ban = async(user_id, cookie) => {
    const response = await post(`/api/v1/users/ban/${user_id}`, {}, cookie)
    return response.body
}

exports.restore = async(user_id, cookie) => {
    const response = await post(`/api/v1/users/restore/${user_id}`, {}, cookie)
    return response.body
}
