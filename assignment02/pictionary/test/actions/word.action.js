const { get, post, put, del } = require('./network.client');

// Admin-only
exports.create = async (cookie, payload) => {
  const response = await post('/api/v1/words', payload, cookie);
  return response.body;
};

exports.update = async (cookie, id, payload) => {
  const response = await put(`/api/v1/words/${id}`, payload, cookie);
  return response.body;
};

exports.remove = async (cookie, id) => {
  // network.client.del should handle 204; body may be undefined
  const response = await del(`/api/v1/words/${id}`, cookie);
  return response.body;
};

// Public (but still behind authValidator in your router)
exports.list = async (cookie, query = '') => {
  const url = '/api/v1/words' + (query ? `?${query}` : '');
  const response = await get(url, cookie);
  return response.body;
};

exports.random = async (cookie) => {
  const response = await get('/api/v1/words/random', cookie);
  return response.body;
};

exports.randomByDiff = async (cookie, difficulty) => {
  const response = await get(`/api/v1/words/random/${difficulty}`, cookie);
  return response.body;
};