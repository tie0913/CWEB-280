const { mongoDb } = require('../db/mongo');

exports.findMany = async () => {
  const db = await mongoDb();
  return db.collection('users').find().limit(100).toArray();
};

exports.insertOne = async (doc) => {
  const db = await mongoDb();
  const r = await db.collection('users').insertOne(doc);
  return { _id: r.insertedId, ...doc };
};
