const {post, get, del } = require('./network.client');

exports.create = async(cookieStore, payload) => {
    const {body} = await post('/api/v1/rooms', cookieStore, payload);
    return body;
}

exports.list = async (cookieStore, query ='') => {
    const url = '/api/v1/rooms' + (query ? `?${query}` : '');
    const {body} = await get(url, cookieStore);
    return body;
}

exports.join = async (cookieStore, roomId) => {
    const {body} = await post(`/api/v1/rooms/${roomId}/join`,{}, cookieStore);
    return body;
}

exports.leave = async (cookieStore, roomId) => {
    const {body} = await post(`/api/v1/rooms/${roomId}/leave`,{}, cookieStore);
    return body;
}

exports.remove = async (cookieStore, roomId) => {
    const {body} = await del(`/api/v1/rooms/${roomId}`, cookieStore);
    return body;
}

exports.start = async (cookieStore, roomId) => {
    const {body} = await post(`/api/v1/rooms/${roomId}/start`,{}, cookieStore);
    return body;
}