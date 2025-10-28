const { ObjectId, Decimal128, Long, Double } = require('mongodb');

/**
 * Recusively convert BSON to JavaScript Object
 * Could be used to convert object coming from MongoDB Driver
 */
function bsonToJs(bson) {
  if (bson == null) return bson; // null 或 undefined
  if (Array.isArray(bson)) return bson.map(bsonToJs);

  if (bson instanceof ObjectId) return bson.toString();

  if (bson instanceof Decimal128) return parseFloat(bson.toString());

  if (bson instanceof Long || bson instanceof Double) return bson.valueOf();

  if (bson instanceof Date) return bson.toISOString();

  if (typeof bson === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(bson)) {
      result[key === '_id' ? 'id' : key] = bsonToJs(value);
    }
    return result;
  }

  return bson; 
}


/**
 * 
 * convert javascript object to bson
 * @returns 
 */
function jsToBson(js){
  const id = js['_id']
  js._id = new ObjectId(id)
  return js
}

module.exports = {bsonToJs, jsToBson};
