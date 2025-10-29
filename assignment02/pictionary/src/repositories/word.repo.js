const { mongoDb} = require('../db/mongo');

class WordRepository{
    async insert(word, tx){
        const db = await mongoDb()
        return db.collection('words').insertOne({word}, {session:tx})
    }

    async findByWord(word, tx){
        const db = await mongoDb()
        return db.collection('words').findOne({word}, {session:tx})
    }

    async getRandom() {
        const db = await mongoDb();
        const result = await db.collection('words')
        .aggregate([{ $sample: { size: 1 } }])
        .toArray();
        return result[0] || null;
    }

    async getRandomByDifficulty(difficulty) {
    const db = await mongoDb();
    const result = await db.collection('words')
      .aggregate([
        { $match: { difficulty } },
        { $sample: { size: 1 } }
      ])
      .toArray();
    return result[0] || null;
  }
}