const UserStatus = require('../constants/UserConstants');
const repo = require('../repositories/users.repo');

class UserService{
  constructor(){
    this.repo = repo
  }

  async getUserByEmail(email) {
    return await this.repo.getUserByEmail(email)
  }

  /**
   * user status 1: activated, 2 banned, 3 deleted
   * @param {} user 
   */
  async createUser(user){
    user['admin'] = false
    UserStatus.activate(user)
    await this.repo.createUser(user)
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
