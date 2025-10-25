const { mongoDb,getSession } = require('../db/mongo');


class UserRepository{

  /**
   * this is for sign in method
   * so we will add status = activated
   * @param  email 
   * @returns 
   */
  async getUserByEmail(email){
    const db = await mongoDb()
    return await db.collection('users').findOne({'email': email}, getSession())
  }


  async getUserByObjectId(userObjectId){
    const db = await mongoDb()
    return await db.collection('users').findOne({'_id': userObjectId}, getSession())
  }

  async createUser(user){
    const db = await mongoDb()
    await db.collection('users').insertOne(user, getSession())
  }

  async updateUser(user){
    const db = await mongoDb()
    await db.collection('users').updateOne({'_id': user['_id']}, {$set: user}, getSession())
    throw new Error('Test error')
  }
}

module.exports = new UserRepository()
/*
exports.findMany = async () => {
  const db = await mongoDb();
  return db.collection('users').find().limit(100).toArray();
};

exports.insertOne = async (doc) => {
  const db = await mongoDb();
  const r = await db.collection('users').insertOne(doc);
  return { _id: r.insertedId, ...doc };
};*/
