
const sessionRepository = require('../repositories/session.repo')
const userRepository = require('../repositories/users.repo')
const {withMongoTx} = require('../db/mongo')
const UserStatus = require('../constants/UserConstants')
const {succeed, fail} = require('../util/response')
/**
 * Session Object
 * {
 *  "_id":ObjectId(),
 *  "userId":ObjectId(), -> This is Foreign Key referencing to user collection _id
 *  "expireAt":Date
 * }
 */

const EXPIRE_TIME_FRAME = 1000 * 60 * 30
class AuthService{

    async signIn(param){
        const user = await userRepository.getUserByEmail(param.email)
        if(user != null && user.password === param.password){
            if(!UserStatus.isActivated(user)){
                return fail(3, 'user is inactivated please contact Administrator', null)
            }

            const userId = user['_id']
            async function createNewSession(){
                const expireAt = new Date(new Date().getTime() + EXPIRE_TIME_FRAME)
                const session = {"userId": userId, "expireAt": expireAt}
                await sessionRepository.deleteSessionByUserId(userId)
                return await sessionRepository.insertSession(session)
            }

            const sessionId = await withMongoTx(createNewSession)
            return succeed(sessionId);
        }else{
            return fail(1, 'email and password does not match')
        }
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
    async signOut(userId){
        await sessionRepository.deleteSessionByUserId(userId)
    }


    async deleteAccount(user){
        UserStatus.delete(user)
        async function tx(){
            await sessionRepository.deleteSessionByUserId(user['_id'])
            await userRepository.updateUser(user)
        }
        await withMongoTx(tx)
    }
}

module.exports = new AuthService()