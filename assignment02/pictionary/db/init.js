use('pictionary');
/**
 * users table structure
 */
db.collection['users'].insertOne({
    "name": "Tie Wang",
    "email": "wangtie_913@outlook.com",
    "password": "123456",
    "admin": true
})

/**
 * session table structure
 */
db.collection['session'].insertOne({
  "userId": "68e53a2627d7e9724394de63",
  "expireAt": {
    "$date": new Date()
  }
})
/**
 * Expire Index for session table
 */
db.collection['session'].createIndex(
  {"expireAt": 1 },
  {"expireAfterSeconds":0}
)

db.collection['users'].createIndex({
    "email":1
},{
    "unique":true
})

db.collection['session'].createIndex({
    "userId":1
},{
    "unique":true
})