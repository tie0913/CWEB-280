const { mongoDb } = require('../db/mongo');


class UserRepository{

  async getUserByEmail(email){
    const db = await mongoDb()
    return await db.collection('users').findOne({'email': email})
  }


  async getUserByObjectId(userObjectId){
    const db = await mongoDb()
    return await db.collection('users').findOne({'_id': userObjectId})
  }

  async createUser(user){
    const db = await mongoDb()
    await db.collection('users').insertOne(user)
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
