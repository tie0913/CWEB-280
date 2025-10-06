const repo = require('../repositories/users.repo');

exports.listUsers = () => repo.findMany();

exports.createUser = async (payload) => {
  if (!payload?.name) throw new Error('name is required');
  return repo.insertOne({ name: payload.name, createdAt: new Date() });
};
