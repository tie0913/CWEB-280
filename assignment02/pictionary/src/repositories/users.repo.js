const { mongoDb} = require('../db/mongo');


class UserRepository{

  /**
   * this is for sign in method
   * so we will add status = activated
   * @param  email 
   * @returns 
   */
  async getUserByEmail(email, sess){
    const db = await mongoDb()
    return await db.collection('users').findOne({'email': email}, {session:sess})
  }


  async getUserByObjectId(userObjectId, sess){
    const db = await mongoDb()
    return await db.collection('users').findOne({'_id': userObjectId}, {session:sess})
  }

  async createUser(user, sess){
    const db = await mongoDb()
    await db.collection('users').insertOne(user, {session:sess})
  }

  async updateUser(user, sess){
    const db = await mongoDb()
    await db.collection('users').updateOne({'_id': user['_id']}, {$set: user}, {session:sess})
    throw new Error('Test error')
  }
}

module.exports = new UserRepository()

