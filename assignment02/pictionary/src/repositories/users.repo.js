const { mongoDb} = require('../db/mongo');


class UserRepository{

  /**
   * this is for sign in method
   * so we will add status = activated
   * @param  email 
   * @returns 
   */
  async getUserByEmail(email, tx){
    const db = await mongoDb()
    return await db.collection('users').findOne({'email': email}, {session:tx})
  }


  async getUserByObjectId(userObjectId, tx){
    const db = await mongoDb()
    return await db.collection('users').findOne({'_id': userObjectId}, {session:tx})
  }

  async createUser(user, tx){
    const db = await mongoDb()
    await db.collection('users').insertOne(user, {session:tx})
  }

  async updateUser(user, tx){
    const db = await mongoDb()
    await db.collection('users').updateOne({'_id': user['_id']}, {$set: user}, {session:tx})
    throw new Error('Test error')
  }
}

module.exports = new UserRepository()

