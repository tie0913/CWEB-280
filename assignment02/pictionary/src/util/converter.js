const { ObjectId, Decimal128, Long, Double } = require('mongodb');

/**
 * Recusively convert BSON to JavaScript Object
 * Could be used to convert object coming from MongoDB Driver
 */
function bsonToJs(bson) {
  if (bson == null) return bson; // null 或 undefined
  if (Array.isArray(bson)) return bson.map(bsonToJs);

  // 处理 ObjectId
  if (bson instanceof ObjectId) return bson.toString();

  // 处理 Decimal128
  if (bson instanceof Decimal128) return parseFloat(bson.toString());

  // 处理 Long / Double
  if (bson instanceof Long || bson instanceof Double) return bson.valueOf();

  // 处理 Date
  if (bson instanceof Date) return bson.toISOString();

  // 普通对象递归处理
  if (typeof bson === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(bson)) {
      result[key === '_id' ? 'id' : key] = bsonToJs(value);
    }
    return result;
  }

  return bson; // 基础类型直接返回
}

module.exports = { bsonToJs };
