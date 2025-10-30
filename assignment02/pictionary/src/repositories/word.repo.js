const { mongoDb } = require("../db/mongo");
const { ObjectId } = require("mongodb");

class WordRepository {
  async col() {
    return (await mongoDb()).collection("words");
  }

  async insert(word, tx) {
    const r = await (await this.col()).insertOne(word, { session: tx });
    return r.insertedId;
  }

  async findById(id, tx) {
    return (await this.col()).findOne(
      { _id: new ObjectId(id) },
      { session: tx }
    );
  }

  async findByWord(word, tx) {
    return (await this.col()).findOne({ word }, { session: tx });
  }

  async update(_id, updates, tx) {
    return (await this.col()).updateOne(
      { _id: new ObjectId(_id) },
      { $set: updates },
      { session: tx }
    );
  }

  async remove(id, tx) {
    return (await this.col()).deleteOne(
      { _id: new ObjectId(id) },
      { session: tx }
    );
  }

  async list({ q, difficulty, skip, limit }) {
    const cond = {};
    if (q) cond.text = { $regex: q, $options: "i" };
    if (difficulty) cond.difficulty = difficulty;

    const c = await this.col();
    const [total, items] = await Promise.all([
      c.countDocuments(cond),
      c.find(cond).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    ]);
    return { total, items };
  }

  async getRandom() {
    const r = await (await this.col())
      .aggregate([{ $sample: { size: 1 } }])
      .toArray();
    return r[0] || null;
  }

  async getRandomByDifficulty(difficulty) {
    const r = await (await this.col())
      .aggregate([{ $match: { difficulty } }, { $sample: { size: 1 } }])
      .toArray();
    return r[0] || null;
  }
}

module.exports = new WordRepository();
