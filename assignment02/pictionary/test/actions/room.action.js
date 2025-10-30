const {post, get, del } = require('./network.client');

exports.create = async(cookieStore, payload) => {
    const response = await post('/api/v1/rooms', payload, cookieStore);
    return response.body;
}

exports.list = async (cookieStore, query ='') => {
    const url = '/api/v1/rooms' + (query ? `?${query}` : '');
    const response = await get(url, cookieStore);
    return response.body;
}

exports.join = async (cookieStore, roomId) => {
    const response = await post(`/api/v1/rooms/${roomId}/join`,{}, cookieStore);
    return response.body;
}

exports.leave = async (cookieStore, roomId) => {
    const response = await post(`/api/v1/rooms/${roomId}/leave`,{}, cookieStore);
    return response.body;
}

exports.remove = async (cookieStore, roomId) => {
    const response = await del(`/api/v1/rooms/${roomId}`, cookieStore);
    return response.body;
}

exports.start = async (cookieStore, roomId) => {
    const response = await post(`/api/v1/rooms/${roomId}/start`,{}, cookieStore);
    return response.body;
}