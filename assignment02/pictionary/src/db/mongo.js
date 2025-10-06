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
  return c.db(process.env.MONGO_DB || 'app');
}
async function closeMongo() { if (client) await client.close(); }

module.exports = { getMongoClient, mongoDb, closeMongo };
