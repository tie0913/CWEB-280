const { mongoDb } = require("../db/mongo");
const { ObjectId } = require("mongodb");

class RoomRepository {
  col = async () => (await mongoDb()).collection("rooms");

  async create(room, tx) {
    const r = await (await this.col()).insertOne(room, { session: tx });
    return r.insertedId;
  }

  async getRoomById(roomId, tx) {
    return await (
      await this.col()
    ).findOne({ _id: new ObjectId(roomId) }, { session: tx });
  }

  async update(roomId, updateObj, tx) {
    return await (
      await this.col()
    ).updateOne(
      { _id: new ObjectId(roomId) },
      { $set: updateObj },
      { session: tx }
    );
  }
  async delete(roomId, tx) {
    return await (
      await this.col()
    ).deleteOne({ _id: new ObjectId(roomId) }, { session: tx });
  }

  async list({ q, visibility, state, skip, limit }) {
    const cond = {};
    if (visibility !== undefined) cond.visibility = visibility;
    if (state !== undefined) cond.state = state;
    if (q) cond.name = { $regex: q, $options: "i" };

    const c = await this.col();
    const [total, items] = await Promise.all([
      c.countDocuments(cond),
      c.find(cond).sort({ updatedAt: -1 }).skip(skip).limit(limit).toArray(),
    ]);
    return { total, items };
  }
}

module.exports = new RoomRepository();
