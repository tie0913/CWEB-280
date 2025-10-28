const {UserStatus} = require('../constants/UserConstants');
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

  async updateUser(user){
    await this.repo.updateUser(user)
  }

  async ban(userObjectId){
    const user = await this.repo.getUserByObjectId(userObjectId)
    UserStatus.ban(user)
    await this.repo.updateUser(user)
  }

  async restoreStatus(userObjectId){
    const user = await this.repo.getUserByObjectId(userObjectId)
    UserStatus.activate(user)
    await this.repo.updateUser(user)
  }
  
  async getUserList(filter, page){
    return await this.repo.getUserList(filter, page)
  }
}

module.exports = new UserService()