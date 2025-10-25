
const { mongoDb} = require('../db/mongo');
class SessionRepository{
    /**
     * create a session and return its primary key as a string variable
     * @param session 
     * @returns 
     */
    async insertSession(session, sess){
        const db = await mongoDb()
        //const result = await db.collection('session').insertOne(session, sessionOpt())
        const result = await db.collection('session').insertOne(session, {session:sess})
        return result.insertedId.toString()
    }

    /**
     * 
     * get a session by id 
     * @param sessionId this is an ObjectId instead of a string
     * @returns 
     */
    async getSessionById(sessionId, sess){
        const db = await mongoDb()
        return await db.collection('session').findOne({'_id': sessionId}, {session:sess})
    }


    async deleteSessionByUserId(userId, sess){
        const db = await mongoDb()
        await db.collection('session').deleteOne({"userId": userId}, {session:sess})
        //await db.collection('session').deleteOne({"userId": userId}, sessionOpt())
    }

}

module.exports = new SessionRepository()