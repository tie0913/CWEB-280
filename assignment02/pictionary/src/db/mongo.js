
const { MongoClient } = require('mongodb');

let client;
async function getMongoClient() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 20, serverSelectionTimeoutMS: 5000 });
    await client.connect();
  }
  return client;
}
async function mongoDb() {
  const c = await getMongoClient();
  return c.db(process.env.MONGO_DB);
}

async function closeMongo() { if (client) await client.close(); }

async function withMongoTx(transaction, txOptions = {
  readConcern: { level: 'snapshot' },
  writeConcern: { w: 'majority' },
  readPreference: 'primary',
}){
  const session = client.startSession();
  try{
    session.startTransaction({})
    const result = await transaction(session)
    await session.commitTransaction()
    return result
  }catch(e){
    await session.abortTransaction()
    throw e
  }finally{
    await session.endSession()
  }
}

module.exports = { getMongoClient, mongoDb, closeMongo , withMongoTx};
