const {UserStatus} = require('../constants/UserConstants');
const repo = require('../repositories/users.repo');

/**
 * UserService class
 *
 * Provides user management operations such as creation, retrieval, updates,
 * banning, and restoring user accounts. Acts as a service layer between
 * controllers and the user repository, applying user status logic where needed.
 */
class UserService{
  constructor(){
    this.repo = repo
  }

  async getUserByEmail(email) {
    return await this.repo.getUserByEmail(email)
  }

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