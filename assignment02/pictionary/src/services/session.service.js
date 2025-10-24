
const sessionRepository = require('../repositories/session.repo')
const {withMongoTx} = require('../db/mongo')
/**
 * Session Object
 * {
 *  "_id":ObjectId(),
 *  "userId":ObjectId(), -> This is Foreign Key referencing to user collection _id
 *  "expireAt":Date
 * }
 */

const EXPIRE_TIME_FRAME = 1000 * 60 * 30
class SessionService{

    async createSession(userId){
        async function createNewSession(){
            const expireAt = new Date(new Date().getTime() + EXPIRE_TIME_FRAME)
            console.log(expireAt)
            const session = {"userId": userId, "expireAt": expireAt}
            await sessionRepository.deleteSessionByUserId(userId)
            return await sessionRepository.insertSession(session)
        }
        return await withMongoTx(createNewSession)
    }

    /**
     * 
     * @param sessionId this must be an variable of ObjectId instead of a string
     * @returns 
     */
    async getSession(sessionId){
        return await sessionRepository.getSessionById(sessionId);
    }

    /**
     * 
     * @param userId this is ObjectId
     */
    async deleteSessionByUserId(userId){
        await sessionRepository.deleteSessionByUserId(userId)
    }
}

module.exports = new SessionService()