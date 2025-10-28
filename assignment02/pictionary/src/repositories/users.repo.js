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

  async deleteUserByUserId(userObjectId, tx){
    const db = await mongoDb()
    await db.collection('users').deleteOne({'_id': userObjectId}, tx)
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
  }


  async getUserList(filter, page, tx){
    const db = await mongoDb()
    const col = db.collection('users')

    const cond = {}
    if(filter.name){
      cond.name = {$regex: '^' + escapeRegex(filter.name), $options:'i'}
    }

    const[recNum, items] = await Promise.all([
      col.countDocuments(cond),
      col.find(cond).skip((page.no - 1) * page.size).limit(page.size).toArray()
    ])

    page.totalPages = Math.ceil(recNum/page.size)
    return {
      list:items,
      page:page,
    }
  }
}

module.exports = new UserRepository()

