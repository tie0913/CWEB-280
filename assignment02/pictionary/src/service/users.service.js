const repo = require('../repositories/users.repo');

exports.listUsers = () => repo.findMany();

exports.createUser = async (payload) => {
  // 这里可做校验/去重等
  if (!payload?.name) throw new Error('name is required');
  return repo.insertOne({ name: payload.name, createdAt: new Date() });
};
