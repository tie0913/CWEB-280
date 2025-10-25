
const { mongoDb} = require('../db/mongo');
class SessionRepository{
    /**
     * create a session and return its primary key as a string variable
     * @param session 
     * @returns 
     */
    async insertSession(session, tx){
        const db = await mongoDb()
        const result = await db.collection('session').insertOne(session, {session:tx})
        return result.insertedId.toString()
    }

    /**
     * 
     * get a session by id 
     * @param sessionId this is an ObjectId instead of a string
     * @returns 
     */
    async getSessionById(sessionId, tx){
        const db = await mongoDb()
        return await db.collection('session').findOne({'_id': sessionId}, {session:tx})
    }


    async deleteSessionByUserId(userId, tx){
        const db = await mongoDb()
        await db.collection('session').deleteOne({"userId": userId}, {session:tx})
    }

}

module.exports = new SessionRepository()