const repo = require('../repositories/users.repo');

class UserService{
  constructor(){
    this.repo = repo
  }

  async getUserByEmail(email) {
    return await this.repo.getUserByEmail(email)
  }

  async getUserByObjectId(userObjectId){
    return await this.repo.getUserByObjectId(userObjectId)
  }
}

module.exports = new UserService()

/*
exports.listUsers = () => repo.findMany();

exports.createUser = async (payload) => {
  if (!payload?.name) throw new Error('name is required');
  return repo.insertOne({ name: payload.name, createdAt: new Date() });
};*/
