
const {AsyncLocalStorage} =require('node:async_hooks')
const { MongoClient } = require('mongodb');
const {bizLogger} = require('../util/biz_logger')

const als = new AsyncLocalStorage()

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
  return c.db(process.env.MONGO_DB || 'app');
}

async function closeMongo() { if (client) await client.close(); }


async function withMongoTx(transaction, txOptions = {
  readConcern: { level: 'snapshot' },
  writeConcern: { w: 'majority' },
  readPreference: 'primary',
}){
  const session = client.startSession();
  try{
    session.startTransaction(txOptions)
    const result = als.run({session}, async () => {
      return await transaction()
    })
    await session.commitTransaction()
    return result
  }catch(e){
    bizLogger.error('transaction failed', e)
    await session.abortTransaction()
    throw e
  }finally{
    await session.endSession()
  }
}

async function getSession(){
  return als.getStore()?.session
}

module.exports = { getMongoClient, mongoDb, closeMongo , withMongoTx, getSession};
